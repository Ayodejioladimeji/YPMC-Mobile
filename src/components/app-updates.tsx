import { Image } from "expo-image"
import Text from "./ui/text"
import { Linking, Platform, StyleSheet, TouchableOpacity, View } from "react-native"
import images from "@/assets/images";
import { colors } from "@/theme";
import { s } from "react-native-size-matters";
import InviteModal from "./ui/invite-modal";




const AppUpdates = ({ isModalVisible, setIsModalVisible, version }) => {

    const handleDownload = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL(process.env.EXPO_PUBLIC_APPLESTORE_DOWNLOAD_LINK);
        } else {
            Linking.openURL(process.env.EXPO_PUBLIC_PLAYSTORE_DOWNLOAD_LINK);
        }
    };

    // 

    return (
        <InviteModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
        >
            <View style={styles.modal}>

                {/* Illustration */}
                <View style={styles.imageContainer}>
                    <Image
                        source={images?.logo}
                        style={styles.image}
                    />
                </View>

                {/* Header Text */}
                <Text style={styles.header}>Discover a{'\n'}<Text style={{ fontFamily: 'interBold', fontSize: s(18), color: colors.primary }}>New version</Text></Text>

                {/* Version */}
                <Text style={styles.version}>YPMC {version}</Text>

                {/* Description */}
                <Text style={styles.description}>
                    Upgrade your App to the latest version{'\n'}
                    to enhance account security and{'\n'}
                    enjoy better services!
                </Text>

                {/* Button */}
                <TouchableOpacity style={styles.button} onPress={handleDownload}>
                    <Text style={styles.buttonText}>Upgrade Now</Text>
                </TouchableOpacity>
            </View>
        </InviteModal>
    )
}

const styles = StyleSheet.create({

    modal: {
        position: 'relative',
    },

    closeText: {
        fontSize: 22,
        color: '#666',
    },
    imageContainer: {
        position: 'absolute',
        top: 20,
        right: 0,
        width: 80,
        height: 80,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    header: {
        color: colors.primary,
        textAlign: 'left',
        alignSelf: 'flex-start',
        marginTop: 20,
        lineHeight: 26,
        fontFamily: 'interBold',
        fontSize: s(18),
        marginBottom: 10
    },
    version: {
        alignSelf: 'flex-start',
        color: '#7A5AF8',
        marginTop: 4,
        fontSize: 14,
        fontWeight: '600',
    },
    description: {
        marginTop: 10,
        fontSize: 14,
        color: '#555',
        textAlign: 'left',
        alignSelf: 'flex-start',
        lineHeight: 20,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        marginTop: 20,
        alignSelf: 'stretch',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});

export default AppUpdates