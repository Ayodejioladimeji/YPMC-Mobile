import TopNavigation from '@/components/TopNavigation';
import { ACTIONS } from '@/store/Actions';
import { DataContext } from '@/store/GlobalState';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import { WebView } from 'react-native-webview';

const Paystack = () => {
    const searchParams = useLocalSearchParams();
    const paystack_url = searchParams.paystack_url as string;
    const amount = searchParams.amount as string;
    const router = useRouter();
    const {dispatch} = useContext(DataContext)

    const handleSuccess = () => {
        router.replace({
            pathname: "/(app)/(tabs)/account/success",
            params: {
                amount
            },
        });
    };


    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: '#fff',
        }}>
            <TopNavigation title="Paystack"/>

            <View style={styles.container}>
                {!paystack_url ? (
                    <ActivityIndicator size="large" color="black" style={styles.loader} />
                ) : (
                    <WebView
                        source={{ uri: paystack_url }}
                        style={styles.webView}
                        onNavigationStateChange={(navState) => {
                            if (navState.url.includes('https://www.ypmcommunity.com')) {
                                handleSuccess();
                            }
                        }}

                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loader: {
        marginTop: 50,
    },
    webView: {
        flex: 1,
        marginHorizontal: vs(16),
        marginTop: s(15),
    },
});

export default Paystack;
