// import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const SplashScreen = ({ navigation }) => {
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkUserType = async () => {
//       try {
//         // Periksa token
    
//         // Periksa tipe pengguna
//         const userData = await AsyncStorage.getItem('user_data');
        
//         console.log('sss', userData);
        
//         if (userData) {
//           // Parse data pengguna
//           const parsedUserData = JSON.parse(userData);
          
//           setTimeout(() => {
//             // Arahkan berdasarkan tipe pengguna yang ada di user data

//             if(parsedUserData.type) {
//               navigation.replace('Home');
//             } else {
//               navigation.replace('HomePageCust');
              
//             }
//             // switch(parsedUserData.type) {
//             //   case 'mitra':
//             //     navigation.replace('Home');
//             //     break;
//             //   case 'user':
//             //     navigation.replace('HomePageCust');
//             //     break;
//             //   default:
//             //     navigation.replace('Login');
//             // }
//           }, 2000); // Delay biar ada efek splash
//         } else {
//           // Jika tidak ditemukan data user meskipun token ada,
//           // mungkin data rusak, arahkan ke Login
//           setTimeout(() => {
//             navigation.replace('Login');
//           }, 2000);
//         }
        
//       } catch (error) {
//         console.error('Error checking user type:', error);
//         setTimeout(() => {
//           navigation.replace('Login');
//         }, 2000);
//       }
//     };

//     checkUserType();
//   }, [navigation]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.logoContainer}>
//         <Image 
//           source={{uri: 'https://ygtechdev.my.id/files/photo-1742080531339-956567367.png'}} 
//           style={styles.logo} 
//         />
//       </View>
//       <ActivityIndicator 
//         size="large" 
//         color="#ffffff" 
//         style={styles.loading} 
//       />
//     </View>
//   );
// };

// export default SplashScreen;

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#14A49C', 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   logoContainer: { 
//     alignItems: 'center' 
//   },
//   logo: { 
//     width: 300, 
//     height: 300 
//   },
//   loading: {
//     marginTop: 20
//   },
//   txtHead: { 
//     color: 'black', 
//     fontWeight: 'bold', 
//     fontSize: 24, 
//     marginTop: 20, 
//     marginBottom: 20 
//   },
// });

import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = ({ navigation }) => {

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        
        console.log('User data:', userData);
        
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          
          setTimeout(() => {
            if(parsedUserData.type) {
              navigation.replace('Home');
            } else {
              navigation.replace('HomePageCust');
            }
          }, 2500);
        } else {
          setTimeout(() => {
            navigation.replace('Login');
          }, 2500);
        }
        
      } catch (error) {
        console.error('Error checking user type:', error);
        setTimeout(() => {
          navigation.replace('Login');
        }, 2500);
      }
    };

    checkUserType();
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#26d0ce']}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        {/* Logo Container dengan Border */}
        <View style={styles.mitraLogoContainer}>
          <View style={styles.mitraLogoBorder}>
            <Image 
              source={{uri: 'https://ygtechdev.my.id/files/photo-1742080531339-956567367.png'}} 
              style={styles.mitraLogo} 
            />
          </View>
        </View>

        {/* Badge Mitra */}
        <View style={styles.mitraBadge}>
          <Text style={styles.mitraBadgeText}>MITRA PARTNER TOMASSAGE</Text>
        </View>

        {/* App Name */}
        <Text style={styles.mitraAppName}>TOMASSAGE</Text>
        <Text style={styles.mitraTagline}>Mitra App</Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color="#ffffff" 
          />
          <Text style={styles.loadingText}>Memuat Aplikasi...</Text>
        </View>

        {/* Footer */}
        <View style={styles.mitraFooter}>
          <View style={styles.footerDivider} />
          <Text style={styles.mitraFooterText}>Solusi Profesional untuk Mitra Terpercaya</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  mitraLogoContainer: {
    marginBottom: 20,
  },
  mitraLogoBorder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  mitraLogo: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  mitraBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mitraBadgeText: {
    color: '#1e3c72',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  mitraAppName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mitraTagline: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 8,
    opacity: 0.9,
    fontWeight: '500',
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 12,
    opacity: 0.8,
  },
  mitraFooter: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  footerDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginBottom: 12,
    opacity: 0.6,
  },
  mitraFooterText: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});