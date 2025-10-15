
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome5';
import BookingConfirmation from '../pages/BookMassage/BookingConfirmation';
import BookingSuccess from '../pages/BookMassage/BookingSuccess';
import JadwalkanScreen from '../pages/BookMassage/JadwalkanScreen';
import LocationSelectScreen from '../pages/BookMassage/LocationSelectScreen';
import ServiceDetail from '../pages/BookMassage/ServiceDetail';
import BookProject from '../pages/BookProject';
import TransactionSuccess from '../pages/BookProject/TransactionSuccess';
import Chat from '../pages/Chat';
import ChatList from '../pages/Chat/ChatList';
import History from '../pages/History';
import HistoryCust from '../pages/History/HistoryCust';
import OrderSummary from '../pages/History/OrderSummary';
import OrderSummaryCust from '../pages/History/OrderSummaryCust';
import Home from '../pages/Home';
import HomeCust from '../pages/Home/HomeCust';
import List from '../pages/List';
import BookingScreen from '../pages/List/BookingScreen';
import CheckoutScreen from '../pages/List/CheckoutScreen';
import ListFlight from '../pages/List/ListFlight';
import ListHotel from '../pages/List/ListHotel';
import PassengerForm from '../pages/List/PassengerForm';
import SuccessSubmissionScreen from '../pages/List/SuccessSubmissionScreen';
import Login from '../pages/Login';
import GetStarted from '../pages/Login/GetStarted';
import InvestorSignup from '../pages/Login/InvestorSignUp';
import Panduan from '../pages/Login/Panduan';
import Register from '../pages/Login/Register';
import RegisterCust from '../pages/Login/RegisterCust';
import SetPasswordScreen from '../pages/Login/SetPasswordScreen';
import VerifikasiWhatsApp from '../pages/Login/VerifikasiWhatsApp';
import VerifPage from '../pages/Login/VerifPage';
import VerifPageCust from '../pages/Login/VerifPageCust';
import VerifWAReg from '../pages/Login/VerifWAReg';
import PaymentHistory from '../pages/PaymentHistory';
import InvestasiReport from '../pages/PaymentHistory/InvestasiReport';
import Pengajuan from '../pages/Pengajuan';
import BankInstruksiCicilan from '../pages/Pengajuan/BankInstruksiCicilan';
import DetailCicilan from '../pages/Pengajuan/DetailCicilan';
import PembayaranBerhasil from '../pages/Pengajuan/PembayaranBerhasil';
import PembayaranCicilan from '../pages/Pengajuan/PembayaranCicilan';
import PengajuanSuccess from '../pages/Pengajuan/PengajuanSuccess';
import RiwayatPengajuan from '../pages/Pengajuan/RiwayatPengajuan';
import Profile from '../pages/Profile';
import PersonalDataScreen from '../pages/Profile/PersonalDataScreen';
import PersonalDataScreenCust from '../pages/Profile/PersonalDataScreenCust';
import ProfileCust from '../pages/Profile/ProfileCust';
import AturServis from '../pages/Servis/AturServis';
import SplashScreen from '../pages/SplashScreen';
import Topup from '../pages/Topup';
import BankInstruction from '../pages/Topup/BankInstruction';
import TopupBank from '../pages/Topup/TopupBank';
import TopupSuccess from '../pages/Topup/TopupSuccess';
import TopupQRIS from '../pages/Topup/TopupQRIS';
import QRISPaymentScreen from '../pages/Topup/QRISPaymentScreen';


import Withdraw from '../pages/Withdraw';
import WithdrawSuccess from '../pages/Withdraw/WithdrawSuccess';
import BookingSearchScreen from '../pages/BookMassage/BookingSearchScreen';
import ChatScreen from '../pages/Chat/ChatScreen';
import RetailPaymentScreen from '../pages/Topup/RetailPaymentScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../context/APIUrl';
import { ActivityIndicator } from 'react-native';
import ForgotPassword from '../pages/ForgotPassword';
import GaspolDelivery from '../pages/GaspolDelivery/ndex';
import OrderBaruGaspol from '../pages/GaspolDelivery/OrderBaruGaspol';
import OrderDropOffPage from '../pages/GaspolDelivery/OrderDropOffPage';
import OrderDetailPage from '../pages/GaspolDelivery/OrderDetailPage';
import OrderPaymentPage from '../pages/GaspolDelivery/OrderPaymentPage';
import DriverSearchScreen from '../pages/GaspolDelivery/DriverSearchScreen';
import OrderSuccessScreen from '../pages/GaspolDelivery/OrderSuccessScreen';
import OrderMap from '../pages/Home/OrderMap';



// import Login from '../screen/Login';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// const MyTabs = () => {
//   return (
//     <Tab.Navigator tabBar={props => <MyTabBar {...props} />} screenOptions={{ headerShown: false }}>
//       <Tab.Screen name="Beranda" title="Tes" component={Home} />
//       <Tab.Screen name="Menu" component={TripScreen} />
//       <Tab.Screen name="Profil" component={Profile} />

//       {/* <Tab.Screen name="Setting" component={Home} /> */}
     
     

//     </Tab.Navigator>
//   );
// }



const MyTabs = () => {
  const refRBSheet = useRef();
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
const [status, setStatus] = useState('active');
const [loading, setLoading] = useState(false);


  const handlePopup = () => {
    refRBSheet.current.open();
  };

  // Ambil data user dan status mitra
useEffect(() => {
  const getUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        
        // Ambil status mitra dari API
        getMitraStatus(parsedUserData.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  getUserData();
}, []);

const getMitraStatus = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/mitra/${id}`);
    if (response.data.success) {
      setStatus(response.data.data.status);
    }
  } catch (error) {
    console.error('Error getting mitra status:', error.response);
  }
};

// Fungsi untuk mengubah status mitra
const toggleStatus = async () => {
  if (!userData || !userData.id) return;
  
  setLoading(true);
  try {
    // Status baru (toggle dari status sekarang)
    const newStatus = status === 'active' ? 'nonactive' : 'active';
    
    // Panggil API untuk update status
    const response = await axios.put(`${API_URL}/mitra/${userData.id}/status`, {
      status: newStatus
    });
    
    if (response.data.success) {
      setStatus(newStatus);
    }
  } catch (error) {
    console.error('Error updating status:', error);
  } finally {
    setLoading(false);
    if (refRBSheet.current) refRBSheet.current.close();
  }
};

return (
  <>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'History') {
            iconName = 'search';
          } else if (route.name === 'Favorites') {
            iconName = 'comment-dots';
          } else if (route.name === 'Account') {
            iconName = 'user';
          }
          return <Icon name={iconName} size={24} color={focused ? 'black' : 'gray'} />;
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'white',
          height: 80,
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen
        name="Emergency"
        component={Home}
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={handlePopup}
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: status === 'active' ? 'red' : 'green',
                alignItems: 'center',
                justifyContent: 'center',
                top: -20,
              }}
            >
              <Icon name={status === 'active' ? "power-off" : "play"} size={30} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen name="Favorites" component={ChatList} />
      <Tab.Screen name="Account" component={Profile} />
    </Tab.Navigator>

    <RBSheet
      ref={refRBSheet}
      height={250}
      openDuration={250}
      customStyles={{
        container: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: 'white',
          padding: 20,
        },
      }}
    >
      <View>
        <Text style={styles.successText}>
          {status === 'active' ? 'Anda Ingin Istirahat?' : 'Anda Ingin Aktif Kembali?'}
        </Text>

        <TouchableOpacity onPress={toggleStatus} disabled={loading}>
          <View style={{ 
            padding: 15, 
            backgroundColor: status === 'active' ? 'red' : 'green', 
            borderRadius: 10, 
            alignItems: 'center', 
            marginTop: 20 
          }}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={[styles.successText, { color: 'white' }]}>
                {status === 'active' ? 'Matikan' : 'Aktifkan'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => {
            if (refRBSheet.current) refRBSheet.current.close();
          }}
          style={{ 
            padding: 15, 
            backgroundColor: '#f0f0f0', 
            borderRadius: 10, 
            alignItems: 'center', 
            marginTop: 10 
          }}
          disabled={loading}
        >
          <Text style={styles.successText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </RBSheet>
  </>
);
};

const MyTabCust = () => {
  const refRBSheet = useRef();
  const navigation = useNavigation();
  
  const handlePopup = () => {
    refRBSheet.current.open();
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'History') {
              iconName = 'search';
            } else if (route.name === 'Favorites') {
              iconName = 'comment-dots';
            } else if (route.name === 'Account') {
              iconName = 'user';
            }
            return <Icon name={iconName} size={24} color={focused ? 'black' : 'gray'} />;
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'white',
            height: 80,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeCust} />
        <Tab.Screen name="History" component={HistoryCust} />
        {/* <Tab.Screen
          name="Emergency"
          component={Home}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                onPress={handlePopup}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: 'red',
                  alignItems: 'center',
                  justifyContent: 'center',
                  top: -20,
                }}
              >
                <Icon name="power-off" size={30} color="white" />
              </TouchableOpacity>
            ),
          }}
        /> */}
        <Tab.Screen name="Favorites" component={ChatList} />
        <Tab.Screen name="Account" component={ProfileCust} />
      </Tab.Navigator>

      <RBSheet
        ref={refRBSheet}
        height={250}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: 'white',
            padding: 20,
          },
        }}
      >
        <View>
          <TouchableOpacity   onPress={() => {
              if (refRBSheet.current) refRBSheet.current.close();
            }}>
          <Text style={styles.successText}>Anda Ingin Istirahat?</Text>

            <View style={{ padding: 15, backgroundColor: 'red', borderRadius: 10, alignItems: 'center', marginTop: 20 }}>
          <Text style={[styles.successText, {
            color: 'white',
          }]}>Matikan</Text>
            
            </View>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </>
  );
};


const Router = () => {
  return (
    <Stack.Navigator initialRouteName="SplashScreen">
       
        <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{headerShown: false}}
    />
   
     <Stack.Screen
      name="ListFlight"
      component={ListFlight}
      options={{headerShown: false}}
    />
    
    <Stack.Screen
      name="Login"
      component={Login}
      options={{headerShown: false}}
    />
     
     <Stack.Screen
      name="GetStarted"
      component={GetStarted}
      options={{headerShown: false}}
    />
       <Stack.Screen
      name="PersonalDataScreen"
      component={PersonalDataScreen}
      options={{headerShown: false}}
    />
     
     <Stack.Screen
      name="PersonalDataScreenCust"
      component={PersonalDataScreenCust}
      options={{headerShown: false}}
    />
     <Stack.Screen
      name="OrderMap"
      component={OrderMap}
      options={{headerShown: false}}
    />
     
      
        <Stack.Screen
      name="DetailRBM"
      component={List}
      options={{headerShown: false}}
    />
      <Stack.Screen
      name="BookProject"
      component={BookProject}
      options={{headerShown: false}}
    />
          <Stack.Screen
      name="PassengerForm"
      component={PassengerForm}
      options={{headerShown: false}}
    />
        <Stack.Screen
      name="CheckoutScreen"
      component={CheckoutScreen}
      options={{headerShown: false}}
    />
      <Stack.Screen
      name="SuccessSubmissionScreen"
      component={SuccessSubmissionScreen}
      options={{headerShown: false}}
    />
       <Stack.Screen
      name="Register"
      component={Register}
      options={{headerShown: false}}
    />
        <Stack.Screen
      name="VerifWAReg"
      component={VerifWAReg}
      options={{headerShown: false}}
    />
        <Stack.Screen
      name="ListHotel"
      component={ListHotel}
      options={{headerShown: false}}
    />
        <Stack.Screen
      name="Chat"
      component={Chat}
      options={{headerShown: false}}
    />
       <Stack.Screen
      name="BookingSearchScreen"
      component={BookingSearchScreen}
      options={{headerShown: false}}
    />
     <Stack.Screen
      name="GaspolDelivery"
      component={GaspolDelivery}
      options={{headerShown: false}}
    />
      <Stack.Screen
      name="OrderBaruGaspol"
      component={OrderBaruGaspol}
      options={{headerShown: false}}
    />
     <Stack.Screen
      name="OrderDropOffPage"
      component={OrderDropOffPage}
      options={{headerShown: false}}
    />
       <Stack.Screen
      name="VerifikasiWhatsApp"
      component={VerifikasiWhatsApp}
      options={{headerShown: false}}
    />
       <Stack.Screen
      name="ServiceDetail"
      component={ServiceDetail}
      options={{headerShown: false}}
    />
     <Stack.Screen
     
      name="BookingScreen"
      component={BookingScreen}
      options={{headerShown: false}}
    />
       <Stack.Screen
     
     name="Panduan"
     component={Panduan}
     options={{headerShown: false}}
   />
        <Stack.Screen
     
     name="SetPasswordScreen"
     component={SetPasswordScreen}
     options={{headerShown: false}}
   />

    <Stack.Screen
     
     name="ForgotPassword"
     component={ForgotPassword}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="InvestorSignup"
     component={InvestorSignup}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="VerifPage"
     component={VerifPage}
     options={{headerShown: false}}
   />
   <Stack.Screen
     
     name="OrderSummary"
     component={OrderSummary}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="TransactionSuccess"
     component={TransactionSuccess}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="BookingConfirmation"
     component={BookingConfirmation}
     options={{headerShown: false}}
   />
   

   <Stack.Screen
     
     name="Topup"
     component={Topup}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="LocationSelectScreen"
     component={LocationSelectScreen}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="TopupBank"
     component={TopupBank}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="BankInstruction"
     component={BankInstruction}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="TopupSuccess"
     component={TopupSuccess}
     options={{headerShown: false}}
   />
   <Stack.Screen
     
     name="OrderSuccess"
     component={OrderSuccessScreen}
     options={{headerShown: false}}
   />

   <Stack.Screen
     
     name="DriverSearchScreen"
     component={DriverSearchScreen}
     options={{headerShown: false}}
   />
   <Stack.Screen
     
     name="OrderDetailPage"
     component={OrderDetailPage}
     options={{headerShown: false}}
   />
     <Stack.Screen
     
     name="OrderPaymentPage"
     component={OrderPaymentPage}
     options={{headerShown: false}}
   />
   

   <Stack.Screen
     
     name="Withdraw"
     component={Withdraw}
     options={{headerShown: false}}
   />
     <Stack.Screen
     
     name="WithdrawSuccess"
     component={WithdrawSuccess}
     options={{headerShown: false}}
   />
   
   <Stack.Screen
     
     name="PaymentHistory"
     component={PaymentHistory}
     options={{headerShown: false}}
   />
     <Stack.Screen
     
     name="OrderSummaryCust"
     component={OrderSummaryCust}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="InvestasiReport"
     component={InvestasiReport}
     options={{headerShown: false}}
   />
   

   <Stack.Screen
     
     name="RegisterCust"
     component={RegisterCust}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="VerifPageCust"
     component={VerifPageCust}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="HomePageCust"
     component={MyTabCust}
     options={{headerShown: false}}
   />
   <Stack.Screen
     
     name="Home"
     component={MyTabs}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="Pengajuan"
     component={Pengajuan}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="PengajuanSuccess"
     component={PengajuanSuccess}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="RiwayatPengajuan"
     component={RiwayatPengajuan}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="DetailCicilan"
     component={DetailCicilan}
     options={{headerShown: false}}
   />
   <Stack.Screen
     
     name="PembayaranCicilan"
     component={PembayaranCicilan}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="BankInstruksiCicilan"
     component={BankInstruksiCicilan}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="PembayaranBerhasil"
     component={PembayaranBerhasil}
     options={{headerShown: false}}
   />
   <Stack.Screen
     
     name="AturServis"
     component={AturServis}
     options={{headerShown: false}}
   />
     <Stack.Screen
     
     name="BookingSuccess"
     component={BookingSuccess}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="JadwalkanScreen"
     component={JadwalkanScreen}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="HistoryCust"
     component={HistoryCust}
     options={{headerShown: false}}
   />
   
   <Stack.Screen
     
     name="ChatScreen"
     component={ChatScreen}
     options={{headerShown: false}}
   />
   
   <Stack.Screen
     
     name="RetailPaymentScreen"
     component={RetailPaymentScreen}
     options={{headerShown: false}}
   />
   

   <Stack.Screen
     
     name="TopupQRIS"
     component={TopupQRIS}
     options={{headerShown: false}}
   />

<Stack.Screen
     
     name="QRISPaymentScreen"
     component={QRISPaymentScreen}
     options={{headerShown: false}}
   />

    </Stack.Navigator>
  )
}

export default Router

const styles = StyleSheet.create({

    tabBar: {
      height: 60,
      backgroundColor: 'black', 
      
    },
    centerButton: {
      top: -40, // Adjust this to position the button correctly
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerButtonContainer: {
      width: 70,
      height: 70,
      borderRadius: 20,
      marginTop: 20,
      backgroundColor: '#D60000', // Change to your desired color
      justifyContent: 'center',
      alignItems: 'center',
    },
    successText: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
      color: "#000",
      textAlign: 'center',
    
    },
    successText: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    }
})