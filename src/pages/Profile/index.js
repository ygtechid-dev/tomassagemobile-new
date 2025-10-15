import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Modal, TouchableOpacity } from 'react-native';
import { Avatar, Text, List, Divider, Button } from 'react-native-paper';

const Profile = ({navigation}) => {
  const [userData, setUserData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error.response);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/6282322000037');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileContainer}>
        {userData &&
          <View style={styles.profileText}>
            <Text variant="titleMedium" style={styles.name}>
              {userData.nama_lengkap}
            </Text>
            <Text variant="bodyMedium" style={styles.spid}>
              SPID #{userData.id}
            </Text>
          </View>
        }
      </View>

      <Divider style={styles.divider} />

      {/* Personal Info Section */}
      <Text variant="titleSmall" style={styles.sectionTitle}>Personal Info</Text>
      <List.Item
        title="Personal Data"
        left={() => <List.Icon icon="account" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => navigation.push('PersonalDataScreen')}
      />

      <Divider style={styles.divider} />

      {/* About Section */}
      <Text variant="titleSmall" style={styles.sectionTitle}>About</Text>
      <List.Item
        title="Pusat Bantuan"
        left={() => <List.Icon icon="help-circle-outline" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => Linking.openURL('https://wa.me/6282322000037')}
      />
      <List.Item
        title="FAQ"
        left={() => <List.Icon icon="frequently-asked-questions" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {
          setActiveTab('faq');
          setModalVisible(true);
        }}
      />
      <List.Item
        title="Kebijakan Pengembalian Dana"
        left={() => <List.Icon icon="cash-refund" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {
          setActiveTab('refund');
          setModalVisible(true);
        }}
      />
      <List.Item
        title="Syarat dan Ketentuan"
        left={() => <List.Icon icon="file-document-outline" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {
          setActiveTab('terms');
          setModalVisible(true);
        }}
      />
      <List.Item
        title="Logout"
        left={() => <List.Icon icon="logout" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={async() => {
          await AsyncStorage.clear()
          navigation.replace('Login')
        }}
      />

      {/* Modal for FAQ, Refund Policy, Terms & Conditions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === 'faq' ? 'FAQ' : 
                 activeTab === 'refund' ? 'Kebijakan Pengembalian Dana' : 
                 'Syarat dan Ketentuan'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'faq' && styles.activeTab]} 
                onPress={() => setActiveTab('faq')}>
                <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>FAQ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'refund' && styles.activeTab]} 
                onPress={() => setActiveTab('refund')}>
                <Text style={[styles.tabText, activeTab === 'refund' && styles.activeTabText]}>Refund Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'terms' && styles.activeTab]} 
                onPress={() => setActiveTab('terms')}>
                <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>Terms & Conditions</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {activeTab === 'faq' && (
                <View style={styles.contentContainer}>
                  <Text style={styles.question}>Apa itu Tomassage?</Text>
                  <Text style={styles.answer}>Tomassage adalah aplikasi yang memungkinkan Anda memesan layanan pijat profesional langsung ke rumah Anda. Kami menghubungkan Anda dengan terapis pijat berpengalaman untuk memberikan kenyamanan maksimal tanpa perlu keluar rumah.</Text>
                  
                  <Text style={styles.question}>Bagaimana cara memesan layanan pijat?</Text>
                  <Text style={styles.answer}>Cukup buka aplikasi Tomassage, pilih jenis pijat yang Anda inginkan, tentukan waktu dan lokasi, lalu konfirmasi pesanan Anda. Sistem kami akan mencarikan terapis pijat terdekat yang tersedia sesuai dengan kriteria Anda.</Text>
                  
                  <Text style={styles.question}>Apakah terapis pijat Tomassage terjamin kualitasnya?</Text>
                  <Text style={styles.answer}>Ya, semua terapis pijat di Tomassage telah melalui proses seleksi ketat, terlatih secara profesional, dan memiliki sertifikasi yang sesuai. Kami juga secara rutin melakukan evaluasi berdasarkan ulasan pelanggan untuk memastikan kualitas layanan tetap terjaga.</Text>
                  
                  <Text style={styles.question}>Berapa lama sebelumnya saya harus memesan?</Text>
                  <Text style={styles.answer}>Kami merekomendasikan pemesanan minimal 2 jam sebelum waktu yang diinginkan. Namun, pemesanan dengan waktu lebih fleksibel akan meningkatkan kemungkinan mendapatkan terapis yang tersedia.</Text>
                  
                  <Text style={styles.question}>Bagaimana cara pembayaran?</Text>
                  <Text style={styles.answer}>Tomassage menerima berbagai metode pembayaran termasuk kartu kredit/debit, e-wallet, dan transfer bank. Pembayaran dilakukan melalui aplikasi setelah Anda mengonfirmasi pemesanan.</Text>
                  
                  <Text style={styles.question}>Apakah saya bisa membatalkan pesanan?</Text>
                  <Text style={styles.answer}>Ya, Anda dapat membatalkan pesanan minimal 1 jam sebelum waktu yang dijadwalkan tanpa dikenakan biaya pembatalan. Pembatalan kurang dari 1 jam sebelum jadwal akan dikenakan biaya sebesar 50% dari nilai pesanan.</Text>
                  
                  <Text style={styles.question}>Bagaimana jika saya tidak puas dengan layanan?</Text>
                  <Text style={styles.answer}>Kepuasan Anda adalah prioritas kami. Jika Anda tidak puas dengan layanan, silakan hubungi tim dukungan pelanggan kami melalui pusat bantuan di aplikasi dalam waktu 24 jam setelah layanan selesai untuk penyelesaian masalah.</Text>
                  
                  <Text style={styles.question}>Apakah Tomassage tersedia di semua kota?</Text>
                  <Text style={styles.answer}>Saat ini Tomassage tersedia di kota-kota besar di Indonesia dan terus melakukan ekspansi. Anda dapat memeriksa ketersediaan layanan di area Anda melalui aplikasi.</Text>
                </View>
              )}

              {activeTab === 'refund' && (
                <View style={styles.contentContainer}>
                  <Text style={styles.subTitle}>1. Persyaratan Refund</Text>
                  <Text style={styles.paragraph}>Tomassage menyediakan kebijakan pengembalian dana dengan ketentuan sebagai berikut:</Text>
                  <Text style={styles.bulletPoint}>• Terapis tidak hadir pada waktu yang dijadwalkan (lebih dari 30 menit)</Text>
                  <Text style={styles.bulletPoint}>• Layanan yang diberikan tidak sesuai dengan deskripsi</Text>
                  <Text style={styles.bulletPoint}>• Masalah teknis pada aplikasi yang menyebabkan gangguan layanan</Text>
                  <Text style={styles.bulletPoint}>• Pembatalan dari pihak Tomassage</Text>
                  
                  <Text style={styles.subTitle}>2. Prosedur Pengajuan Refund</Text>
                  <Text style={styles.paragraph}>Untuk mengajukan pengembalian dana, silakan ikuti langkah-langkah berikut:</Text>
                  <Text style={styles.bulletPoint}>• Hubungi admin Tomassage melalui pusat bantuan dalam aplikasi</Text>
                  <Text style={styles.bulletPoint}>• Berikan informasi detail terkait pesanan (ID Pesanan, tanggal, dll)</Text>
                  <Text style={styles.bulletPoint}>• Jelaskan alasan permintaan refund secara lengkap</Text>
                  <Text style={styles.bulletPoint}>• Lampirkan bukti pendukung (jika ada)</Text>
                  <Text style={styles.bulletPoint}>• Informasi harus diberikan oleh pemilik akun asli</Text>
                  
                  <TouchableOpacity onPress={openWhatsApp} style={styles.linkButton}>
                    <Text style={styles.linkText}>Hubungi Admin Pusat Bantuan</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.subTitle}>3. Jangka Waktu Pengajuan</Text>
                  <Text style={styles.paragraph}>Permintaan refund harus diajukan dalam waktu 24 jam setelah layanan dijadwalkan atau selesai. Pengajuan melewati batas waktu tersebut tidak akan diproses kecuali dalam kondisi khusus.</Text>
                  
                  <Text style={styles.subTitle}>4. Proses Verifikasi</Text>
                  <Text style={styles.paragraph}>Tim Tomassage akan melakukan verifikasi terhadap permintaan refund dalam waktu 1-3 hari kerja. Proses verifikasi meliputi peninjauan riwayat pesanan, komunikasi dengan terapis, dan evaluasi bukti yang diberikan.</Text>
                  
                  <Text style={styles.subTitle}>5. Metode Pengembalian Dana</Text>
                  <Text style={styles.paragraph}>Pengembalian dana akan dilakukan melalui metode pembayaran asli yang digunakan saat transaksi. Waktu yang dibutuhkan untuk pengembalian dana tergantung pada kebijakan pihak penyedia jasa pembayaran (biasanya 3-7 hari kerja).</Text>
                  
                  <Text style={styles.subTitle}>6. Pengembalian Sebagian</Text>
                  <Text style={styles.paragraph}>Dalam beberapa kasus, Tomassage dapat menawarkan pengembalian dana sebagian berdasarkan tingkat ketidaksesuaian layanan yang diberikan.</Text>
                </View>
              )}

              {activeTab === 'terms' && (
                <View style={styles.contentContainer}>
                  <Text style={styles.subTitle}>1. Penerimaan Ketentuan</Text>
                  <Text style={styles.paragraph}>Dengan mengunduh, menginstal, atau menggunakan aplikasi Tomassage, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini. Jika Anda tidak menyetujui salah satu ketentuan ini, Anda tidak diperkenankan menggunakan aplikasi ini.</Text>
                  
                  <Text style={styles.subTitle}>2. Pendaftaran Akun</Text>
                  <Text style={styles.paragraph}>2.1 Untuk menggunakan layanan Tomassage, Anda harus membuat akun dengan memberikan informasi yang akurat dan lengkap.</Text>
                  <Text style={styles.paragraph}>2.2 Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun Anda dan semua aktivitas yang terjadi melalui akun tersebut.</Text>
                  <Text style={styles.paragraph}>2.3 Anda harus berusia minimal 18 tahun untuk membuat akun dan menggunakan layanan.</Text>
                  
                  <Text style={styles.subTitle}>3. Layanan</Text>
                  <Text style={styles.paragraph}>3.1 Tomassage adalah platform yang menghubungkan pengguna dengan penyedia layanan pijat independen.</Text>
                  <Text style={styles.paragraph}>3.2 Tomassage tidak menjamin ketersediaan terapis pada semua waktu dan lokasi.</Text>
                  <Text style={styles.paragraph}>3.3 Kualitas layanan dapat bervariasi dan Tomassage berusaha maksimal untuk memastikan standar kualitas terjaga.</Text>
                  
                  <Text style={styles.subTitle}>4. Pembayaran</Text>
                  <Text style={styles.paragraph}>4.1 Anda setuju untuk membayar semua biaya yang berlaku untuk layanan yang dipesan melalui aplikasi Tomassage.</Text>
                  <Text style={styles.paragraph}>4.2 Harga yang ditampilkan dalam aplikasi dapat berubah sewaktu-waktu tanpa pemberitahuan.</Text>
                  <Text style={styles.paragraph}>4.3 Pembayaran diproses melalui metode pembayaran yang tersedia di aplikasi.</Text>
                  
                  <Text style={styles.subTitle}>5. Pembatalan dan Pengembalian Dana</Text>
                  <Text style={styles.paragraph}>5.1 Kebijakan pembatalan dan pengembalian dana diatur sesuai dengan Refund Policy Tomassage.</Text>
                  <Text style={styles.paragraph}>5.2 Tomassage berhak membatalkan pesanan jika ditemukan indikasi penipuan atau pelanggaran terhadap ketentuan layanan.</Text>
                  
                  <Text style={styles.subTitle}>6. Perilaku Pengguna</Text>
                  <Text style={styles.paragraph}>6.1 Anda setuju untuk tidak menggunakan layanan Tomassage untuk tujuan ilegal atau tidak sah.</Text>
                  <Text style={styles.paragraph}>6.2 Anda akan memperlakukan terapis dengan hormat dan profesional.</Text>
                  <Text style={styles.paragraph}>6.3 Pelecehan dalam bentuk apapun terhadap terapis tidak akan ditoleransi dan dapat mengakibatkan penangguhan atau penghentian akun.</Text>
                  
                  <Text style={styles.subTitle}>7. Privasi</Text>
                  <Text style={styles.paragraph}>7.1 Penggunaan informasi pribadi Anda diatur dalam Kebijakan Privasi Tomassage.</Text>
                  <Text style={styles.paragraph}>7.2 Dengan menggunakan aplikasi, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan Kebijakan Privasi kami.</Text>
                  
                  <Text style={styles.subTitle}>8. Pembatasan Tanggung Jawab</Text>
                  <Text style={styles.paragraph}>8.1 Tomassage tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan.</Text>
                  <Text style={styles.paragraph}>8.2 Tomassage tidak bertanggung jawab atas tindakan, kelalaian, atau perilaku terapis yang disediakan melalui platform.</Text>
                  
                  <Text style={styles.subTitle}>9. Perubahan Ketentuan</Text>
                  <Text style={styles.paragraph}>9.1 Tomassage berhak mengubah syarat dan ketentuan ini sewaktu-waktu.</Text>
                  <Text style={styles.paragraph}>9.2 Perubahan akan efektif setelah dipublikasikan di aplikasi.</Text>
                  <Text style={styles.paragraph}>9.3 Penggunaan berkelanjutan terhadap aplikasi setelah perubahan merupakan penerimaan Anda terhadap ketentuan yang diperbarui.</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileText: {
    marginLeft: 16,
  },
  name: {
    fontWeight: 'bold',
  },
  spid: {
    color: 'gray',
  },
  sectionTitle: {
    marginVertical: 10,
    fontWeight: 'bold',
    color: 'gray',
  },
  divider: {
    marginVertical: 10,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    color: 'gray',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingVertical: 10,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  answer: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    marginLeft: 15,
    lineHeight: 20,
  },
  linkButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 15,
  },
  linkText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Profile;