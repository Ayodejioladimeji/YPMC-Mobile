import React from 'react';
import { SafeAreaView, StatusBar, useColorScheme, StyleSheet } from 'react-native';

const SafeAreaViews = ({ children }: { children: React.ReactNode }) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: 'white' }]}>
            <StatusBar
                barStyle='dark-content'
                backgroundColor='white'
            />
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default SafeAreaViews;
