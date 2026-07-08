import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';

// --- KOMPONEN INPUT LANGSUNG (Agar aman dari error import) ---
function LocalInput({ label, placeholder, value, onChangeText, error, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 6 }}>{label}</Text>
      <TextInput
        style={{
          height: 44,
          backgroundColor: '#f8f9fa',
          borderWidth: 1,
          borderColor: error ? '#e74c3c' : '#dcdde1',
          borderRadius: 8,
          paddingHorizontal: 12,
          fontSize: 14,
        }}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {error && <Text style={{ fontSize: 12, color: '#e74c3c', marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

// --- KOMPONEN TOMBOL LANGSUNG (Agar aman dari error import) ---
function LocalButton({ title, onPress }) {
  return (
    <TouchableOpacity 
      style={{
        backgroundColor: '#ee4d2d',
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
      }}
      onPress={onPress}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{title}</Text>
    </TouchableOpacity>
  );
}

// --- KOMPONEN UTAMA ---
export default function UasPrakPemmob() {
  // State Navigasi & Auth
  const [currentScreen, setCurrentScreen] = useState('Login'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentTab, setCurrentTab] = useState('Home'); 

  // State Keranjang Belanja
  const [cartItems, setCartItems] = useState([]);
  
  // State Metode Pembayaran
  const [selectedPayment, setSelectedPayment] = useState('COD'); 
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);

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

  // Sembunyikan ProductCard dinamis jika file ProductCard.js bermasalah
  const renderProductCardLocal = (item, onPress) => {
    const hargaRupiah = item.price * 15000;
    const formatRupiah = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(hargaRupiah);

    return (
      <TouchableOpacity 
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          borderRadius: 12,
          margin: 8,
          padding: 8,
          borderWidth: 1,
          borderColor: '#f1f2f6',
          maxWidth: '48%', 
          minWidth: '45%',
        }} 
        onPress={onPress}
      >
        <Image 
          source={{ uri: item.thumbnail }} 
          style={{ width: '100%', height: 120, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 8 }} 
          resizeMode="contain"
        />
        <View style={{ paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2c3e50', height: 36 }} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 11, color: '#7f8c8d', textTransform: 'uppercase', marginVertical: 4 }}>{item.category}</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#ee4d2d' }}>{formatRupiah}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const toRupiah = (usd) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(usd * 15000);
  };

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

  const fetchProducts = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await fetch('https://dummyjson.com/products');
      const data = await response.json();
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (err) {
      setApiError('Gagal memuat data produk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const addToCart = (product, buyNow = false) => {
    const exist = cartItems.find((x) => x.id === product.id);
    if (exist) {
      setCartItems(cartItems.map((x) => x.id === product.id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCartItems([...cartItems, { ...product, qty: 1 }]);
    }
    
    if (buyNow) {
      setCurrentTab('Cart');
      setCurrentScreen('Home');
      setShowPaymentSelection(true);
    } else {
      alert(`${product.title} berhasil dimasukkan ke keranjang!`);
    }
  };

  const handleConfirmOrder = () => {
    alert(`🎉 Pesanan Berhasil Dibuat!\n\nMetode Pembayaran: ${selectedPayment}\nTotal Tagihan: ${getTotalPrice()}\n\nTerima kasih telah berbelanja.`);
    setCartItems([]);
    setShowPaymentSelection(false);
    setCurrentTab('Home');
  };

  const getTotalPrice = () => {
    const totalUsd = cartItems.reduce((a, c) => a + c.price * c.qty, 0);
    return toRupiah(totalUsd);
  };

  const renderLoginScreen = () => (
    <View style={styles.authContainer}>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>KampusMarket</Text>
        <Text style={styles.authSubtitle}>Marketplace Jual-Beli Mahasiswa</Text>
        
        <LocalInput label="Nama Lengkap" placeholder="Masukkan nama" value={name} onChangeText={setName} error={errors.name} />
        <LocalInput label="Email" placeholder="mahasiswa@uir.ac.id" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <LocalInput label="Password" placeholder="Minimal 6 karakter" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
        
        <LocalButton title="Masuk Aplikasi" onPress={handleLogin} />
      </View>
    </View>
  );

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
          <Image source={{ uri: selectedProduct.thumbnail }} style={styles.detailImage} resizeMode="contain" />
          <View style={styles.detailInfoBox}>
            <Text style={styles.detailPrice}>{toRupiah(selectedProduct.price)}</Text>
            <Text style={styles.detailTitle}>{selectedProduct.title}</Text>
            <Text style={styles.detailCategory}>Kategori: {selectedProduct.category.toUpperCase()}</Text>
            <View style={styles.divider} />
            <Text style={styles.detailDescTitle}>Deskripsi Produk:</Text>
            <Text style={styles.detailDescription}>{selectedProduct.description}</Text>
          </View>
        </ScrollView>
        <View style={styles.shopeeActionBar}>
          <TouchableOpacity style={styles.addToCartBtn} onPress={() => addToCart(selectedProduct, false)}>
            <Text style={styles.addToCartText}>+ Keranjang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowBtn} onPress={() => addToCart(selectedProduct, true)}>
            <Text style={styles.buyNowText}>Beli Sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (currentTab === 'Cart') {
      return (
        <View style={{ flex: 1 }}>
          {cartItems.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.infoText}>Keranjang belanja Anda kosong 🛒</Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <ScrollView style={{ flex: 1, padding: 8 }}>
                {!showPaymentSelection && cartItems.map((item) => (
                  <View key={item.id} style={styles.cartCard}>
                    <Image source={{ uri: item.thumbnail }} style={styles.cartItemImage} resizeMode="contain" />
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.cartItemPrice}>{toRupiah(item.price)}</Text>
                      <Text style={styles.cartItemQty}>Jumlah: {item.qty}x</Text>
                    </View>
                  </View>
                ))}

                {showPaymentSelection && (
                  <View style={styles.paymentSection}>
                    <Text style={styles.paymentSectionTitle}>Pilih Metode Pembayaran</Text>
                    <Text style={styles.paymentSectionSubtitle}>Silakan pilih jalur pembayaran Anda:</Text>

                    <TouchableOpacity style={[styles.paymentOptionCard, selectedPayment === 'COD' && styles.paymentOptionCardActive]} onPress={() => setSelectedPayment('COD')}>
                      <Text style={styles.paymentIcon}>💵</Text>
                      <View style={styles.paymentTextGroup}>
                        <Text style={styles.paymentName}>Cash on Delivery (COD)</Text>
                        <Text style={styles.paymentDesc}>Bayar langsung tunai di area kampus UIR</Text>
                      </View>
                      <View style={[styles.radioCircle, selectedPayment === 'COD' && styles.radioCircleActive]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.paymentOptionCard, selectedPayment === 'QRIS' && styles.paymentOptionCardActive]} onPress={() => setSelectedPayment('QRIS')}>
                      <Text style={styles.paymentIcon}>📱</Text>
                      <View style={styles.paymentTextGroup}>
                        <Text style={styles.paymentName}>QRIS / E-Wallet</Text>
                        <Text style={styles.paymentDesc}>Scan otomatis via GoPay, OVO, Dana, LinkAja</Text>
                      </View>
                      <View style={[styles.radioCircle, selectedPayment === 'QRIS' && styles.radioCircleActive]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.paymentOptionCard, selectedPayment === 'M-Banking' && styles.paymentOptionCardActive]} onPress={() => setSelectedPayment('M-Banking')}>
                      <Text style={styles.paymentIcon}>🏦</Text>
                      <View style={styles.paymentTextGroup}>
                        <Text style={styles.paymentName}>Transfer M-Banking</Text>
                        <Text style={styles.paymentDesc}>Transfer via Bank BRI, BCA, BNI, Mandiri, dll</Text>
                      </View>
                      <View style={[styles.radioCircle, selectedPayment === 'M-Banking' && styles.radioCircleActive]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelPaymentBtn} onPress={() => setShowPaymentSelection(false)}>
                      <Text style={styles.cancelPaymentText}>← Ubah Item Keranjang</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.checkoutFooter}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total Tagihan:</Text>
                  <Text style={styles.totalPriceText}>{getTotalPrice()}</Text>
                </View>
                {showPaymentSelection ? (
                  <TouchableOpacity style={styles.checkoutBtn} onPress={handleConfirmOrder}>
                    <Text style={styles.checkoutBtnText}>Buat Pesanan</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.checkoutBtn} onPress={() => setShowPaymentSelection(true)}>
                    <Text style={styles.checkoutBtnText}>Check Out ({cartItems.reduce((a, c) => a + c.qty, 0)})</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      );
    }

    if (currentTab === 'Profile') {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.profileName}>Halo, {name}!</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => { setIsLoggedIn(false); setCurrentScreen('Login'); setCartItems([]); setShowPaymentSelection(false); }}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <TextInput style={styles.searchBar} placeholder="Cari barang bekas atau kategori..." value={searchQuery} onChangeText={setSearchQuery} />
        {loading && <ActivityIndicator size="large" color="#ee4d2d" style={{ marginTop: 20 }} />}
        {apiError && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        )}
        {!loading && !apiError && (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={({ item }) => renderProductCardLocal(item, () => { setSelectedProduct(item); setCurrentScreen('Detail'); })}
            ListEmptyComponent={<Text style={styles.emptyText}>Produk tidak ditemukan</Text>}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    );
  };

  const renderMainApp = () => (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KampusMarket</Text>
        {currentTab === 'Home' && cartItems.length > 0 && (
          <TouchableOpacity style={styles.cartIconBadge} onPress={() => setCurrentTab('Cart')}>
            <Text style={styles.badgeText}>🛒 {cartItems.reduce((a, c) => a + c.qty, 0)}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.contentArea}>
        {renderTabContent()}
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, currentTab === 'Home' && styles.activeTab]} onPress={() => { setCurrentTab('Home'); setShowPaymentSelection(false); }}>
          <Text style={[styles.tabText, currentTab === 'Home' && styles.activeTabText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, currentTab === 'Cart' && styles.activeTab]} onPress={() => setCurrentTab('Cart')}>
          <Text style={[styles.tabText, currentTab === 'Cart' && styles.activeTabText]}>Keranjang</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, currentTab === 'Profile' && styles.activeTab]} onPress={() => { setCurrentTab('Profile'); setShowPaymentSelection(false); }}>
          <Text style={[styles.tabText, currentTab === 'Profile' && styles.activeTabText]}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isLoggedIn) return renderLoginScreen();
  if (currentScreen === 'Detail') return renderDetailScreen();
  return renderMainApp();
}

const styles = StyleSheet.create({
  authContainer: { flex: 1, backgroundColor: '#f5f6fa', justifyContent: 'center', alignItems: 'center' },
  authCard: { width: '85%', backgroundColor: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' },
  authTitle: { fontSize: 28, fontWeight: 'bold', color: '#ee4d2d', textAlign: 'center' },
  authSubtitle: { fontSize: 13, color: '#7f8c8d', textAlign: 'center', marginBottom: 24 },
  mainContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { height: 60, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f2f6', paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  cartIconBadge: { backgroundColor: '#fff', padding: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ee4d2d' },
  badgeText: { fontSize: 12, color: '#ee4d2d', fontWeight: 'bold' },
  backButton: { color: '#ee4d2d', fontSize: 16, fontWeight: '600' },
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
  
  detailImage: { width: '100%', height: 300, backgroundColor: '#fff' },
  detailInfoBox: { padding: 16, backgroundColor: '#fff', marginTop: 8, borderRadius: 8 },
  detailPrice: { fontSize: 24, fontWeight: 'bold', color: '#ee4d2d', marginBottom: 8 },
  detailTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  detailCategory: { color: '#7f8c8d', fontSize: 13, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#f1f2f6', marginVertical: 12 },
  detailDescTitle: { fontSize: 15, fontWeight: '600', color: '#2c3e50', marginBottom: 6 },
  detailDescription: { fontSize: 14, color: '#57606f', lineHeight: 22 },
  
  shopeeActionBar: { height: 54, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f2f6' },
  addToCartBtn: { flex: 1, backgroundColor: '#00bfa5', justifyContent: 'center', alignItems: 'center' },
  addToCartText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  buyNowBtn: { flex: 1, backgroundColor: '#ee4d2d', justifyContent: 'center', alignItems: 'center' },
  buyNowText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  cartCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: '#f1f2f6' },
  cartItemImage: { width: 70, height: 70, borderRadius: 6, backgroundColor: '#f8f9fa' },
  cartItemInfo: { flex: 1, marginLeft: 12 },
  cartItemTitle: { fontSize: 15, fontWeight: '600', color: '#2c3e50' },
  cartItemPrice: { fontSize: 14, color: '#ee4d2d', fontWeight: 'bold', marginTop: 4 },
  cartItemQty: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },

  paymentSection: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f1f2f6' },
  paymentSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  paymentSectionSubtitle: { fontSize: 12, color: '#7f8c8d', marginBottom: 16 },
  paymentOptionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 14, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#f1f2f6' },
  paymentOptionCardActive: { borderColor: '#ee4d2d', backgroundColor: '#fff5f2' },
  paymentIcon: { fontSize: 24, marginRight: 12 },
  paymentTextGroup: { flex: 1 },
  paymentName: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  paymentDesc: { fontSize: 11, color: '#7f8c8d', marginTop: 2 },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#cbd5e1' },
  radioCircleActive: { borderColor: '#ee4d2d', backgroundColor: '#ee4d2d' },
  cancelPaymentBtn: { marginTop: 8, padding: 8, alignItems: 'center' },
  cancelPaymentText: { color: '#7f8c8d', fontSize: 13, fontWeight: '600' },

  checkoutFooter: { height: 60, backgroundColor: '#fff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f2f6', alignItems: 'center', paddingLeft: 16 },
  totalContainer: { flex: 1, justifyContent: 'center' },
  totalLabel: { fontSize: 12, color: '#7f8c8d' },
  totalPriceText: { fontSize: 16, fontWeight: 'bold', color: '#ee4d2d' },
  checkoutBtn: { backgroundColor: '#ee4d2d', height: '100%', width: 140, justifyContent: 'center', alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  tabBar: { height: 60, backgroundColor: '#fff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f2f6' },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTab: { borderTopWidth: 2, borderTopColor: '#ee4d2d' },
  tabText: { fontSize: 12, color: '#a4b0be' },
  activeTabText: { color: '#ee4d2d', fontWeight: 'bold' },
});