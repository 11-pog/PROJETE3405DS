import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import BarraInicial from '../../functions/barra_inicial'; 

const users = [
  { id: "1", name: "Bot da troca", avatar: "https://cdn-icons-png.flaticon.com/512/1999/1999625.png" },
  { id: "2", name: "Giovana", avatar: "https://cdn-icons-png.flaticon.com/512/2922/2922510.png" },
];

export default function UsersList() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.userItem}
            onPress={() => router.push({ pathname: "/pages/chat/bot", params: { name: item.name, avatar: item.avatar } })}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    <View style={styles.bottomBar}>
        <BarraInicial />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  userItem: { flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  name: { fontSize: 16, color: "#333" },
});
