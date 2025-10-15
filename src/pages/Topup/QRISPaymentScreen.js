import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image, Clipboard, ToastAndroid } from 'react-native';
import axios from 'axios';
import { API_URL, API_URL_PROD } from '../../context/APIUrl';

const QRISPaymentScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [qrisData, setQrisData] = useState(null);   
  const [error, setError] = useState(null);
  const { userData, total } = route.params;
  
  console.log('tottt', userData);
  
  // Function to copy QR String to clipboard
  const copyQRStringToClipboard = () => {
    if (qrisData && qrisData.qr_string) {
      Clipboard.setString(qrisData.qr_string);
      ToastAndroid.show('QRIS code disalin!', ToastAndroid.SHORT);
    }
  };
  
  // Function to create QRIS payment
  const createQRIS = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Data to send to backend
      const paymentData = {
        amount: total,
        name: userData.nama_lengkap || 'Customer',
        email: userData.email || '',
        phone: userData.nomor_wa || '',
        productName: 'Top Up Saldo',
        orderId: `INV-${Date.now()}`,
        user_id: userData.id || null
      };
      
      // Request to your Express.js API
      const response = await axios.post(
        `${API_URL_PROD}/payment/create-qris-tomas`, 
        paymentData
      );
      
      if (response.data.status === 'success') {
        setQrisData({
          ...response.data.data.qrisData,
          qr_string: response.data.data.qrisData.QrString,
          transaction_id: response.data.data.qrisData.TransactionId,
          reference_id: response.data.data.qrisData.ReferenceId,
          status: response.data.data.qrisData.Status || 'pending',
          expired: response.data.data.qrisData.Expired
        });
      } else {
        setError(response.data.message || 'Gagal membuat QRIS');
      }
    } catch (err) {
      console.error('Error creating QRIS:', err.response);
      setError('Terjadi kesalahan saat membuat QRIS. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  // Check payment status
  const checkPaymentStatus = async () => {
    if (!qrisData || !qrisData.transaction_id) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL_PROD}/payment/check-status-tomas`,
        { transactionId: qrisData.transaction_id }
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
            
            // Remove formatting to get numeric amount
            
            // Call balance update API
            const balanceUpdateResponse = await axios.patch(
              `${API_URL}/mitra/${userId}/balance`,
              {
                amount: total,
                operation: 'add'
              }
            );
            
            console.log('Balance update response:', balanceUpdateResponse.data);
            
            if (balanceUpdateResponse.data.status === 'success') {
              // Update transaction status in your database if needed
              await updateTransactionStatus(qrisData.transaction_id, 'success');
              
              // Show success message with updated balance
              Alert.alert(
                'Pembayaran Berhasil',
                `Terima kasih, pembayaran Anda telah berhasil! Saldo Anda sekarang Rp ${formatRupiah(balanceUpdateResponse.data.data.current_balance)}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } else {
              // Balance updated failed but payment was successful
              Alert.alert(
                'Pembayaran Berhasil',
                'Pembayaran Anda berhasil, tetapi pembaruan saldo gagal. Silakan hubungi customer service.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          } catch (balanceError) {
            console.error('Error updating balance:', balanceError.response);
            const userId = userData.id;

        //  await axios.post(`${API_URL}/balances`, {
        //       user_id: userId,
        //       total_balance: total
        //     }).then((res) => {
        //       Alert.alert(
        //         'Pembayaran Berhasil',
        //         'Pembayaran Top Up Anda berhasil',
        //         [{ text: 'OK', onPress: () => navigation.goBack() }]
        //       );
        //     }).catch((err) => {
        //       Alert.alert(
        //         'Pembayaran Berhasil',
        //         'Pembayaran Top Up Anda berhasil namun tidak terupdate di Sistem. Silahkan Hubungi CS',
        //         [{ text: 'OK', onPress: () => navigation.goBack() }]
        //       );
        //     })


            // Show error but acknowledge payment was successful
          
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
  
  // Helper function to format currency
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };
  
  // Call createQRIS when component mounts
  useEffect(() => {
    createQRIS();
  }, []);
  
  // Render QR code
  const renderQRCode = () => {
    if (!qrisData || !qrisData.qr_string) return null;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrisData.qr_string)}`;
    
    return (
      <View style={styles.qrImageContainer}>
        <Image
          source={{ uri: qrUrl }}
          style={styles.qrImage}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.copyButton}
          onPress={copyQRStringToClipboard}
        >
          <Text style={styles.copyButtonText}>Salin QRIS Code</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Pembayaran QRIS</Text>
      
      {loading && !qrisData && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14A49C" />
          <Text style={styles.loadingText}>Membuat QRIS...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={createQRIS}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {qrisData && (
        <View style={styles.qrisContainer}>
          <Text style={styles.amountText}>
            Total Pembayaran: Rp {Number(total).toLocaleString('id-ID')}
          </Text>
          
          {renderQRCode()}
          
          <Text style={styles.instructionText}>
            Scan QRIS dengan aplikasi e-wallet atau mobile banking Anda
          </Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>ID Transaksi</Text>
            <Text style={styles.infoValue}>{qrisData.transaction_id}</Text>
            
            <Text style={styles.infoLabel}>Referensi</Text>
            <Text style={styles.infoValue}>{qrisData.reference_id || '-'}</Text>
            
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{qrisData.status || 'pending'}</Text>
            
            <Text style={styles.infoLabel}>Kadaluarsa</Text>
            <Text style={styles.infoValue}>{qrisData.expired ? new Date(qrisData.expired).toLocaleString('id-ID') : '-'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={checkPaymentStatus}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.refreshButtonText}>Cek Status Pembayaran</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
    textAlign: 'center',
  },
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6C757D',
  },
  errorContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#14A49C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrisContainer: {
    alignItems: 'center',
    padding: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  qrImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE2E5',
    padding: 15,
    marginBottom: 20,
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  copyButton: {
    marginTop: 10,
    backgroundColor: '#E9ECEF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  copyButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  instructionText: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#212529',
    marginBottom: 16,
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#14A49C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  cancelButtonText: {
    color: '#6C757D',
    fontSize: 16,
  },
});

export default QRISPaymentScreen;