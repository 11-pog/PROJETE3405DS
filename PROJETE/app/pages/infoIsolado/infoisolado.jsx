import { View, Text, Image, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function InfoIsolado() {
  const { id, title, author, description, cover, addedBy, userImage, actionType } = useLocalSearchParams();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      {/* Botão de voltar */}
      <Pressable
        onPress={() => router.push("/pages/principal/principal")}
        style={{ padding: 12 }}
      >
        <Ionicons name="arrow-back" size={28} color="#25373bff" />
      </Pressable>

      {/* Container principal */}
      <View style={{ alignItems: "center", padding: 20 }}>
        {/* Capa */}
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={{
              width: 150,
              height: 220,
              borderRadius: 12,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 5,
              elevation: 5,
            }}
          />
        ) : (
          <View
            style={{
              width: 150,
              height: 220,
              backgroundColor: "#e09f3e",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          />
        )}

        {/* Título e autor */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#9e2a2b",
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#1b2c31ff",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          {author}
        </Text>

      {/* Descrição */}
<View style={{ width: "90%", marginBottom: 20 }}>
  <Text
    style={{
      fontWeight: "bold",
      fontSize: 16,
      color: "#335c67",
      marginBottom: 6,
    }}
  >
     Descrição:
  </Text>
  <Text
    style={{
      fontSize: 13,
      color: "#333",
      backgroundColor: "#fff",
      padding: 12,
      borderRadius: 15,
      shadowColor: "#000",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      textAlign: "justify",
    }}
  >
    {description || "Nenhuma descrição disponível"}
  </Text>
</View>

        {/* Informações do usuário que adicionou */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 20,
            width: "90%",
            shadowColor: "#000",
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >

          {/* Foto do usuário */}
          {userImage ? (
            <Image
              source={{ uri: userImage }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: "#e09f3e",
                marginRight: 10,
              }}
            />
          ) : (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#e09f3e",
                marginRight: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="person" size={28} color="#F5F5F5" />
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", color: "#335c67" }}>
              Livro adicionado por:
            </Text>
            <Text style={{ color: "#9e2a2b", marginBottom: 4 }}>
            </Text> {/* colocar o nome do usuario aqui quando estiver pronto*/}
            <Text style={{ color: "#335c67" }}>
              Tipo de ação: {actionType || "Não especificado"} {/* aqui tem que arrumar çocorro*/}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
