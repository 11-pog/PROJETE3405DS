import { View, Text, Image, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router'



export default function InfoIsolado() {
  const { id, title, author, description, cover } = useLocalSearchParams();

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#f5f5f5" }}>
       <Pressable  onPress={() => router.push('/pages/principal/principal')}> <Ionicons name="arrow-back" size={24} color="#000" /> </Pressable>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        {cover ? (
          <Image source={{ uri: cover }} style={{ width: 150, height: 220, borderRadius: 10 }} />
        ) : (
          <View style={{ width: 150, height: 220, backgroundColor: "#ddd", borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#555" }}>Sem capa</Text>
          </View>
        )}
      </View>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Título: {title} - Autor(a): {author}</Text>
      <Text style={{ fontSize: 15, color: "#555" }}>Descrição: {description || "Nenhuma descrição disponível"}</Text>
     
    </ScrollView>
  );
}
