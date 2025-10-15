import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal
} from "react-native";
import { Card, Button, TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { API_URL, API_URL_PROD } from '../../context/APIUrl';

const retailChannels = [
  { 
    name: "Alfamart", 
    value: "alfamart",
    icon: "store",
    color: "#EC1C24"
  },
  { 
    name: "Indomaret", 
    value: "indomaret",
    icon: "store",
    color: "#0079C1"
  }
];

const RetailPaymentScreen = ({ navigation, route }) => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [amount, setAmount] = useState("1000000");
  const [formattedAmount, setFormattedAmount] = useState("Rp 1.000.000");
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [visible, setVisible] = useState(false);

  const quickAmounts = ["10000", "50000", "100000"];
  const { userData } = route.params || { userData: {} };

  // Format angka ke Rupiah untuk tampilan
 
  
  // Handle perubahan input jumlah
  const handleAmountChange = (text) => {
    // Hapus format Rupiah dan simpan angka saja
    const numericValue = text.replace(/[^0-9]/g, "");
    
    // Update state dengan nilai numerik (untuk digunakan saat navigasi)
    setAmount(numericValue);
    
    // Update state untuk tampilan dengan format Rupiah
    setFormattedAmount(formatRupiah(numericValue));
  };
  
  // Handle tombol jumlah cepat
  const handleQuickAmount = (value) => {
    setAmount(value);
    setFormattedAmount(formatRupiah(value));
  };
  
  // Helper function to format currency
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  // Check payment status
  const checkPaymentStatus = async (transactionId) => {
    if (!transactionId) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL_PROD}/payment/check-status-tomas`,
        { transactionId: transactionId }
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
            // Get user ID from userData
            const userId = userData.id;
            
            if (!userId) {
              console.error('User ID is missing');
              throw new Error('User ID not found');
            }
            
            // Call balance update API
            const balanceUpdateResponse = await axios.patch(
              `${API_URL}/mitra/${userId}/balance`,
              {
                amount: amount,
                operation: 'add'
              }
            );
            
            console.log('Balance update response:', balanceUpdateResponse.data);
            
            if (balanceUpdateResponse.data.status === 'success') {
              // Update transaction status in your database if needed
              await updateTransactionStatus(transactionId, 'success');
              
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
            const userId = userData.id;

            // Fallback if the first method fails
            try {
              await axios.post(`${API_URL}/balances`, {
                user_id: userId,
                total_balance: amount
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
  
  // Helper function to update transaction status in your database
  const updateTransactionStatus = async (transactionId, status) => {
    try {
      // Call your transaction update API
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

  // Handle tombol proses pembayaran
  const handleProcessPayment = async () => {
    if (!selectedChannel) {
      Alert.alert("Kesalahan", "Silakan pilih metode pembayaran terlebih dahulu");
      return;
    }

    // Pastikan amount adalah nilai numerik
    const numericAmount = amount.replace(/[^0-9]/g, "");
    
    if (parseInt(numericAmount) < 10000) {
      Alert.alert("Kesalahan", "Minimal transaksi adalah Rp 10.000");
      return;
    }
    
    setLoading(true);
    
    try {
      // Data untuk API
      const paymentData = {
        amount: numericAmount,
        name: userData.nama_lengkap || userData.name || "User",
        email: userData.email || "",
        phone: userData.nomor_wa || userData.phone || "082100000000",
        productName: "Top Up Saldo",
        orderId: `INV-${Date.now()}`,
        user_id: userData.id || "user123",
        paymentChannel: selectedChannel.value
      };
      
      // Call API
      const response = await axios.post(
        `${API_URL_PROD}/payment/create-retail-payment`,
        paymentData
      );

      console.log('payres', response.data.data);
      
      
      setPaymentResult(response.data.data);
      setVisible(true);
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert(
        "Gagal membuat pembayaran", 
        error.response?.data?.message || "Terjadi kesalahan, silakan coba lagi nanti"
      );
    } finally {
      setLoading(false);
    }
  };

  // Modal detail pembayaran
  const renderPaymentDetails = () => {
    if (!paymentResult) return null;
    
    return (
      <View style={styles.paymentDetails}>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Kode Pembayaran:</Text>
          <Text style={styles.codeValue}>{paymentResult.paymentData.paymentCode}</Text>
        </View>
        
        <View style={styles.amountDetails}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Jumlah</Text>
            <Text style={styles.amountValue}>
              {formatRupiah(paymentResult.paymentData.amount)}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Biaya Admin</Text>
            <Text style={styles.amountValue}>
              {formatRupiah(2500 || 0)}
            </Text>
          </View>
          <View style={[styles.amountRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatRupiah(paymentResult.paymentData.total)}
            </Text>
          </View>
        </View>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Cara Pembayaran:</Text>
          {paymentResult.paymentData.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{index + 1}</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.expiredInfoContainer}>
          <Icon name="clock-outline" size={16} color="#E74C3C" />
          <Text style={styles.expiredInfo}>
            Bayar sebelum {new Date(paymentResult.paymentData.expired).toLocaleString('id-ID')}
          </Text>
        </View>
      </View>
    );
  };
    
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <ImageBackground source={require("../../assets/bground.png")} style={styles.headerBackground}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Top Up via Retail</Text>
            <View style={styles.iconButton} />
          </View>
        </ImageBackground>

        {/* Card Section */}
        <Card style={styles.card}>
          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
            <Text style={styles.subtitle}>Pilih retailer untuk pembayaran</Text>
            
            <View style={styles.channelsContainer}>
              {retailChannels.map((channel, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.channelItem, 
                    selectedChannel?.value === channel.value && styles.selectedChannel
                  ]} 
                  onPress={() => setSelectedChannel(channel)}
                >
                  <Icon name={channel.icon} size={24} color={channel.color} />
                  <Text style={styles.channelName}>{channel.name}</Text>
                  {selectedChannel?.value === channel.value && (
                    <Icon name="check-circle" size={20} color="#1EAAA6" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jumlah Top Up</Text>
            <Text style={styles.subtitle}>Berapa yang akan Anda top-up?</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="Rp 0"
              value={formattedAmount}
              onChangeText={handleAmountChange}
            />
            <View style={styles.quickAmountContainer}>
              {quickAmounts.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.quickAmountButton} 
                  onPress={() => handleQuickAmount(item)}
                >
                  <Text style={styles.quickAmountText}>
                    {formatRupiah(item)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Continue Button */}
      <Button 
        mode="contained" 
        style={styles.continueButton}
        loading={loading}
        disabled={loading || !selectedChannel} 
        onPress={handleProcessPayment}
      >
        {loading ? 'Memproses...' : 'Proses Pembayaran'}
      </Button>

      {/* Regular Modal for Payment Result */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalHeader}>
                <View style={styles.successIconContainer}>
                  <Icon name="check-circle" size={50} color="#1EAAA6" />
                </View>
                <Text style={styles.modalTitle}>
                  Detail Pembayaran
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedChannel?.name}
                </Text>
                <Text style={styles.modalInstructions}>
                  Silakan selesaikan pembayaran Anda sesuai instruksi berikut
                </Text>
              </View>
              
              {renderPaymentDetails()}
            </ScrollView>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => checkPaymentStatus()}
              >
                <Text style={styles.secondaryButtonText}>Sudah Bayar</Text>
              </TouchableOpacity>
              
              {/* {paymentResult && paymentResult.transaction && (
                <TouchableOpacity 
                  style={styles.primaryButtonContainer}
                  onPress={() => {
                    setVisible(false);
                    navigation.navigate('PaymentDetailScreen', {
                      paymentData: paymentResult.paymentData,
                      transaction: paymentResult.transaction
                    });
                  }}
                >
                  <Text style={styles.primaryButtonText}>Lihat Detail</Text>
                  <Icon name="arrow-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )} */}
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Icon name="close" size={22} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerBackground: {
    height: 180,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    marginTop: -80,
    minHeight: 500
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: 5,
    marginTop: 10
  },
  subtitle: {
    fontSize: 14,
    color: "#A0A0A0",
    marginBottom: 15,
  },
  channelsContainer: {
    marginTop: 10,
  },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedChannel: {
    backgroundColor: "#E8F8F2",
    borderColor: "#1EAAA6",
  },
  channelName: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#1EAAA6",
    paddingVertical: 5,
    backgroundColor: 'transparent',
    marginTop: 10,
    textAlign: "center",
    color: "#333",
  },
  quickAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: "#E8F8F2",
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  quickAmountText: {
    color: "#1EAAA6",
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#1EAAA6",
    borderRadius: 30,
    margin: 20,
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: "white",
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  modalScrollView: {
    maxHeight: '85%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E1E1E",
    marginTop: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#1EAAA6",
    fontWeight: "600",
    marginTop: 5,
  },
  modalInstructions: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginTop: 10,
  },
  paymentDetails: {
    marginBottom: 20,
  },
  codeContainer: {
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  codeLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E1E1E",
    letterSpacing: 2,
    marginTop: 5,
  },
  amountDetails: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  amountLabel: {
    color: "#666",
  },
  amountValue: {
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    color: "#1E1E1E",
    fontWeight: "bold",
  },
  totalValue: {
    color: "#1EAAA6",
    fontWeight: "bold",
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E1E1E",
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  instructionNumber: {
    backgroundColor: "#1EAAA6",
    color: "white",
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: "center",
    marginRight: 12,
    lineHeight: 26,
    fontWeight: "bold",
    overflow: "hidden",
  },
  instructionText: {
    flex: 1,
    color: "#333",
  },
  expiredInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDEDEC",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  expiredInfo: {
    marginLeft: 8,
    color: "#E74C3C",
    fontSize: 13,
    fontWeight: "500",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1EAAA6',
    borderRadius: 25,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1EAAA6',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1EAAA6',
    borderRadius: 25,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 5,
  },
});

export default RetailPaymentScreen;