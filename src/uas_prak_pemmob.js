import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';
import ProductCard from './components/ProductCard';

export default function UasPrakPemmob() {
  // State Navigasi & Auth
  const [currentScreen, setCurrentScreen] = useState('Login'); // Login, Home, Detail
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentTab, setCurrentTab] = useState('Home'); // Home, Wishlist, Profile

  // State Form Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});

  // State API & Produk
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Validasi Form & Handle Login
  const handleLogin = () => {
    let localErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!name.trim()) localErrors.name = 'Nama wajib diisi';
    if (!emailRegex.test(email)) localErrors.email = 'Format email tidak valid';
    if (password.length < 6) localErrors.password = 'Password minimal 6 karakter';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
    } else {
      setErrors({});
      setIsLoggedIn(true);
      setCurrentScreen('Home');
      fetchProducts();
    }
  };

  // Fetch Data dari API DummyJSON
  const fetchProducts = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await fetch('https://dummyjson.com/products');
      const data = await response.json();
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (err) {
      setApiError('Gagal memuat data produk. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time Search Filter berdasarkan judul atau kategori
  useEffect(() => {
    const filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // --- SCREEN 1: LOGIN SCREEN ---
  const renderLoginScreen = () => (
    <View style={styles.authContainer}>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>KampusMarket</Text>
        <Text style={styles.authSubtitle}>Marketplace Jual-Beli Mahasiswa</Text>
        
        <CustomInput label="Nama Lengkap" placeholder="Masukkan nama" value={name} onChangeText={setName} error={errors.name} />
        <CustomInput label="Email" placeholder="mahasiswa@uir.ac.id" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <CustomInput label="Password" placeholder="Minimal 6 karakter" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
        
        <CustomButton title="Masuk Aplikasi" onPress={handleLogin} />
      </View>
    </View>
  );

  // --- SCREEN 2: DETAIL PRODUK ---
  const renderDetailScreen = () => {
    if (!selectedProduct) return null;
    return (
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentScreen('Home')}>
            <Text style={styles.backButton}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Produk</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView style={styles.contentArea}>
          <Image source={{ uri: selectedProduct.thumbnail }} style={styles.detailImage} />
          <View style={styles.detailInfoBox}>
            <Text style={styles.detailCategory}>{selectedProduct.category.toUpperCase()}</Text>
            <Text style={styles.detailTitle}>{selectedProduct.title}</Text>
            <Text style={styles.detailPrice}>${selectedProduct.price}</Text>
            <Text style={styles.detailDescTitle}>Deskripsi Produk:</Text>
            <Text style={styles.detailDescription}>{selectedProduct.description}</Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  // --- TAB CONTENT INDIKATOR ---
  const renderTabContent = () => {
    if (currentTab === 'Wishlist') {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>Keranjang / Wishlist Anda kosong.</Text>
        </View>
      );
    }
    if (currentTab === 'Profile') {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.profileName}>Halo, {name}!</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => { setIsLoggedIn(false); setCurrentScreen('Login'); }}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Default: Tab Home (Katalog Produk)
    return (
      <View style={{ flex: 1 }}>
        <TextInput style={styles.searchBar} placeholder="Cari barang bekas atau kategori..." value={searchQuery} onChangeText={setSearchQuery} />
        {loading && <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 20 }} />}
        {apiError && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{apiError}</Text>
            <CustomButton title="Coba Lagi" onPress={fetchProducts} />
          </View>
        )}
        {!loading && !apiError && (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <ProductCard item={item} onPress={() => { setSelectedProduct(item); setCurrentScreen('Detail'); }} />
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Produk tidak ditemukan</Text>}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    );
  };

  // --- MAIN APP WITH TAB NAVIGATION ---
  const renderMainApp = () => (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KampusMarket</Text>
      </View>
      <View style={styles.contentArea}>
        {renderTabContent()}
      </View>
      {/* Bottom Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, currentTab === 'Home' && styles.activeTab]} onPress={() => setCurrentTab('Home')}>
          <Text style={[styles.tabText, currentTab === 'Home' && styles.activeTabText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, currentTab === 'Wishlist' && styles.activeTab]} onPress={() => setCurrentTab('Wishlist')}>
          <Text style={[styles.tabText, currentTab === 'Wishlist' && styles.activeTabText]}>Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, currentTab === 'Profile' && styles.activeTab]} onPress={() => setCurrentTab('Profile')}>
          <Text style={[styles.tabText, currentTab === 'Profile' && styles.activeTabText]}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Alur Penentuan Screen Utama
  if (!isLoggedIn) return renderLoginScreen();
  if (currentScreen === 'Detail') return renderDetailScreen();
  return renderMainApp();
}

const styles = StyleSheet.create({
  authContainer: { flex: 1, backgroundColor: '#f5f6fa', justifyContent: 'center', alignItems: 'center' },
  authCard: { width: '85%', backgroundColor: '#ffffff', borderRadius: 16, padding: 24, elevation: 4 },
  authTitle: { fontSize: 28, fontWeight: 'bold', color: '#2ecc71', textAlign: 'center' },
  authSubtitle: { fontSize: 13, color: '#7f8c8d', textAlign: 'center', marginBottom: 24 },
  mainContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { height: 60, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f2f6', paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  backButton: { color: '#2ecc71', fontSize: 16, fontWeight: '600' },
  contentArea: { flex: 1, padding: 8 },
  searchBar: { height: 44, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dcdde1', borderRadius: 8, paddingHorizontal: 12, margin: 8, fontSize: 14 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  infoText: { color: '#7f8c8d', fontSize: 16 },
  errorText: { color: '#e74c3c', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#7f8c8d', marginTop: 20 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  profileEmail: { fontSize: 14, color: '#7f8c8d', marginTop: 4, marginBottom: 24 },
  logoutBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#e74c3c', borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  detailImage: { width: '100%', height: 250, backgroundColor: '#fff' },
  detailInfoBox: { padding: 16, backgroundColor: '#fff', marginTop: 8, borderRadius: 8 },
  detailCategory: { color: '#2ecc71', fontWeight: 'bold', fontSize: 12 },
  detailTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginVertical: 8 },
  detailPrice: { fontSize: 20, fontWeight: '700', color: '#e74c3c', marginBottom: 16 },
  detailDescTitle: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 6 },
  detailDescription: { fontSize: 14, color: '#7f8c8d', lineHeight: 20 },
  tabBar: { height: 60, backgroundColor: '#fff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f2f6' },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTab: { borderTopWidth: 2, borderTopColor: '#2ecc71' },
  tabText: { fontSize: 12, color: '#a4b0be' },
  activeTabText: { color: '#2ecc71', fontWeight: 'bold' },
});