import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const scannerSize = width * 0.7;

const ScanScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [flashOn, setFlashOn] = useState(false);

  // Simulate QR code scan
  const simulateScan = () => {
    // Simulate data from a QR code
    setScannedData("https://example.com/menu/special-offer");
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleOpenLink = () => {
    if (scannedData && scannedData.startsWith("http")) {
      Linking.openURL(scannedData).catch((err) => {
        Alert.alert("Error", "Could not open the link");
      });
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Mock Camera View */}
      <View style={styles.cameraContainer}>
        <View style={styles.camera}>
          {/* Gradient overlay to simulate camera view */}
          <View style={styles.cameraOverlay}>
            {/* Scanner frame */}
            <View style={styles.scannerFrame}>
              <View style={styles.scannerCorner1} />
              <View style={styles.scannerCorner2} />
              <View style={styles.scannerCorner3} />
              <View style={styles.scannerCorner4} />
              <View style={styles.scanLine} />
            </View>

            <Text style={styles.scanInstructions}>
              Align the QR code within the frame to scan
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
          <Icon
            name={flashOn ? "flash" : "flash-off"}
            size={24}
            color="#333"
          />
          <Text style={styles.controlText}>Flash</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scanButton} onPress={simulateScan}>
          <Icon name="scan-outline" size={30} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Icon name="images-outline" size={24} color="#333" />
          <Text style={styles.controlText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Scanned Data Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>QR Code Result</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.resultContainer}>
              <Icon name="checkmark-circle" size={60} color="#4CAF50" />
              <Text style={styles.resultText}>Successfully Scanned!</Text>
              <Text style={styles.resultData} numberOfLines={2}>
                {scannedData}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.openButton]}
                onPress={handleOpenLink}
              >
                <Text style={styles.openButtonText}>Open</Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  camera: {
    width: '100%',
    height: height * 0.5,
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: scannerSize,
    height: scannerSize,
    borderRadius: 10,
    position: 'relative',
  },
  scannerCorner1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
  },
  scannerCorner2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
  },
  scannerCorner3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
  },
  scannerCorner4: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
  },
  scanLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#E63946',
    position: 'absolute',
    top: '50%',
  },
  scanInstructions: {
    position: 'absolute',
    bottom: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    width: '100%',
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlText: {
    marginTop: 8,
    color: '#333',
    fontSize: 12,
  },
  scanButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  resultData: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  openButton: {
    backgroundColor: '#E63946',
  },
  openButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    margin: 30,
    color: '#333',
  },
  permissionButton: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ScanScreen;