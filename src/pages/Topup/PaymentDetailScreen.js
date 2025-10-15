import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  ScrollView,
  ImageBackground,
  Alert,
  ActivityIndicator
} from "react-native";
import { Card, Button, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { API_URL, API_URL_PROD } from '../../context/APIUrl';

const PaymentDetailScreen = ({ navigation, route }) => {
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const { paymentData, transaction } = route.params;
  
  // Format untuk channel display
  const getChannelDisplay = () => {
    const channel = transaction.payment_channel;
    switch(channel.toLowerCase()) {
      case 'alfamart':
      case 'alfa':
        return {
          name: "Alfamart/Alfamidi/Dan+Dan",
          icon: "store",
          color: "#EC1C24",
        };
      case 'indomaret':
        return {
          name: "Indomaret",
          icon: "store", 
          color: "#0079C1",
        };
      default:
        return {
          name: channel,
          icon: "store",
          color: "#333333",
        };
    }
  };

  const channelInfo = getChannelDisplay();
  
  // Format angka ke Rupiah untuk tampilan
  const formatRupiah = (value) => {
    const number = parseFloat(value);
    return `Rp ${number.toLocaleString("id-ID")}`;
  };
  
  // Hitung countdown
  useEffect(() => {
    if (!paymentData.expired) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      const expiredDate = new Date(paymentData.expired);
      const timeDiff = expiredDate - now;
      
      if (timeDiff <= 0) {
        clearInterval(timer);
        setCountdown("Waktu pembayaran telah habis");
      } else {
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [paymentData.expired]);
  
  // Copy payment code to clipboard
  const copyPaymentCode = () => {
    if (paymentData.paymentCode) {
      // Using the native clipboard API
      navigator.clipboard.writeText(paymentData.paymentCode);
      alert("Kode pembayaran telah disalin");
    }
  };
  
  // Check payment status
  const checkPaymentStatus = async () => {
    if (!transaction || !transaction.transaction_id) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL_PROD}/payment/check-status-tomas`,
        { transactionId: transaction.transaction_id }
      );
      
      if (response.data.status === 'success') {
        const status = response.data.data.paymentStatus;
        console.log('Payment status:', status);
        
        // Check if status has PaidStatus property
        const paidStatus = status.PaidStatus || status;
        console.log('Paid status:', paidStatus);
        
        if (paidStatus === 'paid' || paidStatus === 'berhasil' || paidStatus === 'success') {
          // Payment successful - update user balance
          try {
            // Get user ID from transaction
            const userId = transaction.user_id;
            
            if (!userId) {
              console.error('User ID is missing');
              throw new Error('User ID not found');
            }
            
            // Call balance update API
            const balanceUpdateResponse = await axios.patch(
              `${API_URL}/mitra/${userId}/balance`,
              {
                amount: paymentData.amount,
                operation: 'add'
              }
            );
            
            console.log('Balance update response:', balanceUpdateResponse.data);
            
            if (balanceUpdateResponse.data.status === 'success') {
              // Update transaction status in database
              await updateTransactionStatus(transaction.transaction_id, 'success');
              
              // Show success message with updated balance
              Alert.alert(
                'Pembayaran Berhasil',
                `Terima kasih, pembayaran Anda telah berhasil! Saldo Anda sekarang Rp ${formatRupiah(balanceUpdateResponse.data.data.current_balance)}`,
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
              );
            } else {
              // Balance updated failed but payment was successful
              Alert.alert(
                'Pembayaran Berhasil',
                'Pembayaran Anda berhasil, tetapi pembaruan saldo gagal. Silakan hubungi customer service.',
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
              );
            }
          } catch (balanceError) {
            console.error('Error updating balance:', balanceError.response);
            const userId = transaction.user_id;

            // Fallback method
            try {
              await axios.post(`${API_URL}/balances`, {
                user_id: userId,
                total_balance: paymentData.amount
              });
              
              Alert.alert(
                'Pembayaran Berhasil',
                'Pembayaran Top Up Anda berhasil',
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
              );
            } catch (err) {
              Alert.alert(
                'Pembayaran Berhasil',
                'Pembayaran Top Up Anda berhasil namun tidak terupdate di Sistem. Silahkan Hubungi CS',
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
              );
            }
          }
        } else {
          // Payment not successful yet
          Alert.alert(
            'Status Pembayaran', 
            `Status pembayaran: ${paidStatus}. Silakan selesaikan pembayaran Anda.`
          );
        }
      } else {
        Alert.alert('Error', response.data.message || 'Gagal memeriksa status pembayaran.');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      Alert.alert('Error', 'Gagal memeriksa status pembayaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to update transaction status in database
  const updateTransactionStatus = async (transactionId, status) => {
    try {
      // Call transaction update API
      await axios.patch(
        `${API_URL}/payment-transactions/${transactionId}`,
        { status: status }
      );
      console.log(`Transaction ${transactionId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating transaction status:', error.response);
      // We don't throw the error here to avoid disrupting the main flow
    }
  };
  
  // Share payment details
  const sharePaymentDetails = async () => {
    try {
      const channelName = channelInfo.name;
      const message = 
        `Detail Pembayaran via ${channelName}\n\n` +
        `Kode Pembayaran: ${paymentData.paymentCode}\n` +
        `Jumlah: ${formatRupiah(paymentData.total)}\n` +
        `Batas Waktu: ${new Date(paymentData.expired).toLocaleString('id-ID')}\n\n` +
        `Silakan lakukan pembayaran di ${channelName} terdekat.`;
      
      await Share.share({
        message,
        title: "Detail Pembayaran",
      });
    } catch (error) {
      alert("Error sharing: " + error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground source={require("../../assets/bground.png")} style={styles.headerBackground}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pembayaran</Text>
          <TouchableOpacity style={styles.iconButton} onPress={sharePaymentDetails}>
            <Icon name="share-variant" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      
      <ScrollView>
        <Card style={styles.card}>
          {/* Status Section */}
          <View style={styles.statusContainer}>
            <Icon name="clock-outline" size={36} color="#F39C12" />
            <Text style={styles.statusTitle}>Menunggu Pembayaran</Text>
            <Text style={styles.statusSubtitle}>Selesaikan pembayaran sebelum batas waktu</Text>
            
            {countdown && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>Batas Waktu:</Text>
                <Text style={styles.countdown}>{countdown}</Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Payment Code Section */}
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Kode Pembayaran:</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeValue}>{paymentData.paymentCode}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={copyPaymentCode}>
                <Icon name="content-copy" size={20} color="#1EAAA6" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Payment Method */}
          <View style={styles.paymentMethodContainer}>
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
            <View style={styles.channelRow}>
              <Icon name={channelInfo.icon} size={24} color={channelInfo.color} />
              <Text style={styles.channelName}>{channelInfo.name}</Text>
            </View>
          </View>
          
          {/* Payment Details */}
          <View style={styles.paymentDetailsContainer}>
            <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID Transaksi</Text>
              <Text style={styles.detailValue}>{transaction.transaction_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal</Text>
              <Text style={styles.detailValue}>
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Produk</Text>
              <Text style={styles.detailValue}>{transaction.product_name}</Text>
            </View>
            <Divider style={[styles.divider, styles.smallDivider]} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jumlah</Text>
              <Text style={styles.detailValue}>
                {formatRupiah(paymentData.amount)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Biaya Admin</Text>
              <Text style={styles.detailValue}>
                {formatRupiah(paymentData.fee || 0)}
              </Text>
            </View>
            <Divider style={[styles.divider, styles.smallDivider]} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalValue}>
                {formatRupiah(paymentData.total)}
              </Text>
            </View>
          </View>
          
          {/* Payment Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.sectionTitle}>Cara Pembayaran</Text>
            {paymentData.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumberContainer}>
                  <Text style={styles.instructionNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
      
      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Button 
          mode="outlined" 
          style={styles.cancelButton}
          onPress={() => navigation.navigate('Home')}
        >
          Kembali ke Beranda
        </Button>
        <Button 
          mode="contained" 
          style={styles.finishButton}
          onPress={checkPaymentStatus}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Memeriksa...' : 'Cek Status Pembayaran'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerBackground: {
    height: 100,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    margin: 15,
    marginTop: -20,
    padding: 20,
    elevation: 3,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E1E1E",
    marginTop: 10,
  },
  statusSubtitle: {
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#FEF9E7",
    borderRadius: 10,
    padding: 10,
  },
  countdownLabel: {
    color: "#666",
    marginRight: 10,
  },
  countdown: {
    color: "#F39C12",
    fontWeight: "bold",
    fontSize: 16,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: "#E0E0E0",
  },
  smallDivider: {
    marginVertical: 10,
  },
  codeContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  codeLabel: {
    color: "#666",
    marginBottom: 5,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E1E1E",
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
    backgroundColor: "#E8F8F2",
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: 15,
  },
  paymentMethodContainer: {
    marginBottom: 20,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
  },
  channelName: {
    fontSize: 16,
    marginLeft: 15,
  },
  paymentDetailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailLabel: {
    color: "#666",
    flex: 1,
  },
  detailValue: {
    color: "#333",
    textAlign: "right",
    flex: 1,
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1EAAA6",
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  instructionNumberContainer: {
    backgroundColor: "#1EAAA6",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  instructionNumber: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  instructionText: {
    flex: 1,
    color: "#333",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: "#1EAAA6",
  },
  finishButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#1EAAA6",
  },