import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import axios from 'axios';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const List = ({ route }) => {
  const { rbm } = route.params; // Get rbm from route params

  const [pelanggan, setPelanggan] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigation = useNavigation(); // Navigation hook

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://ygtechdev.my.id/get-pelanggan");
        const data = response.data.data;

        // Filter data by rbm
        const filtered = data.filter((item) => item.rbm === rbm.rbm && item.status === "Belum Lunas");
        setPelanggan(filtered);
        setFilteredData(filtered);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [rbm]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = pelanggan.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedItem) return;

    console.log('rbm', selectedItem);
    

    try {
      const response = await axios.put(`https://ygtechdev.my.id/datapelanggan/${selectedItem.id}`, {
        status: status,
      });
      if (response.status === 200) {
        setPelanggan((prevPelanggan) =>
          prevPelanggan.map((item) =>
            item.idpel === selectedItem.idpel ? { ...item, status: status } : item
          )
        );
        setFilteredData((prevData) =>
          prevData.map((item) =>
            item.idpel === selectedItem.idpel ? { ...item, status: status } : item
          )
        );

        alert('Berhasil Update Status ke LUNAS')
        navigation.replace('Home')
      }
    } catch (error) {
      console.error("Error updating status:", error.response);
    }
    handleCloseModal();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with search icon */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Data Tunggakan</Text>
        <FontAwesome5Icon name="search" size={18} color="#fff" style={styles.headerIcon} />
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <FontAwesome5Icon name="search" size={16} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari Pelanggan..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* List of items */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.idpel.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleOpenModal(item)}>
            <View style={styles.card}>
              {/* <View style={styles.icon}>
                <Text style={styles.iconText}>{item.nama.charAt(0)}</Text>
              </View> */}
              <View style={styles.info}>
                <Text style={styles.name}>{item.idpel} - {item.nama}</Text>
                <Text style={styles.address}>{item.alamat} | {item.day}</Text>
                <Text style={styles.details}>{item.rbm} | {item.lgk} | {item.lembar} </Text>
                <Text style={styles.tagihan}>Tagihan: Rp. {item.rptagihan.toLocaleString()},-</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Apakah tunggakan ini sudah Lunas?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleUpdateStatus("Lunas")}
              >
                <Text style={styles.modalButtonText}>Ya</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalButtonText}>Tidak</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#2c94df",
    padding: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerIcon: {
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f8d7da",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    alignItems: "center",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    marginBottom: 5,
  },
  details: {
    fontSize: 12,
    color: "#555",
    marginBottom: 5,
  },
  tagihan: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#d9534f",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default List;
