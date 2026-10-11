import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWS } from '../context/ServiceProvider';

const HomeScreen = ({ navigation }) => {
    const { emit, on, connected, off } = useWS();
    const [leadData, setleadata] = useState([]);
    useEffect(() => {
        // console.log("HomeScreen useffect called", connected);
        if (!connected) {
            return;
        }

        on("new_lead", (data) => {
            //console.log("Received new_lead  from server:", data);
            setleadata(pre => ((pre.at(-1)?.leadgenId === data?.leadgenId) ? [pre] : [...pre, data]));
        });
        emit("message", { message: "Hello from client!" });

        return () => {
            off("message");
        };
    }, [connected]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>WELCOME TO unQueFrontend </Text>
                </View>
            </View>
            <View style={styles.caintain}>
                {(leadData.length) ? (leadData.map((item, index) => {
                    return (
                        <View key={index} style={{ marginBottom: 10 }}>
                            <Text style={styles.caintainText}>Lead LeadgenId: {item.leadgenId}</Text>
                            <Text style={styles.caintainText}>Lead Email: {item.email}</Text>
                            <Text style={styles.caintainText}>Lead Name: {item.full_name}</Text>
                            <Text style={styles.caintainText}>Lead Phone: {item.phone_number}</Text>
                        </View>
                    )
                })) : (
                    <Text style={styles.caintainText}>No Leads Found</Text>
                )}
            </View>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F7FB' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 10, justifyContent: 'space-between', marginBottom: 18 },
    title: { color: 'black', fontSize: 18, fontWeight: '700', letterSpacing: 1.8 },
    caintain: { padding: 10, marginBottom: 30 },
    caintainText: { color: 'black', fontSize: 14, fontWeight: '700' }
});

export default HomeScreen;

