import { useState, useEffect, useCallback } from "react"
import { View, Text, Image, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../functions/api";

export default function InfoIsolado() {
  const { id, path_back } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);

  const getBook = useCallback(async () => {
    try {
      const response = await api.get(`livros/${id}/`);
      const data = response.data;

      setBook(data.book);
      setCreator(data.post_creator);
    } catch (error) {
      console.error("Erro ao buscar livro:", error);
    } finally {
      setLoading(false);
    }
  }, [id])

  function handleStarPress(star) {
    setRating(star);
    // later: api.post(`/livros/${id}/rating/`, { rating: star })
  }

  useEffect(() => {
    getBook()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading || !book || !creator) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      {/* Botão de voltar */}
      <Pressable
        onPress={() => router.push(path_back)}
        style={{ padding: 12 }}
      >
        <Ionicons name="arrow-back" size={28} color="#25373bff" />
      </Pressable>

      {/* Container principal */}
      <View style={{ alignItems: "center", padding: 20 }}>
        {/* Capa */}
        {book.post_cover ? (
          <Image
            source={{ uri: book.post_cover }}
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

        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#9e2a2b",
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          {book.book_title}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#1b2c31ff",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {book.book_author}
        </Text>
        
        {book.book_genre && (
          <View style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 12,
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
              color: "#000",
            }}>
              📚 {{
                'romance_narrativa': 'Romance/Narrativa',
                'poesia': 'Poesia',
                'peca_teatral': 'Peça Teatral',
                'didatico': 'Didático',
                'nao_ficcao': 'Não-ficção'
              }[book.book_genre] || book.book_genre}
            </Text>
          </View>
        )}

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
            {book.book_description || "Nenhuma descrição disponível"}
          </Text>
        </View>

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

          {creator.image_url ? (
            <Image
              source={{ uri: creator.image_url }}
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
              {creator.username}
            </Text>
            <View style={{ flexDirection: "column", flexWrap: "wrap" }}>
              <Text style={{ fontWeight: "bold", color: "#335c67" }}>
              Disponível para:
            </Text>
            <Text style={{ color: "#9e2a2b", marginBottom: 4 }}>
             {book.post_type === 'emprestimo' ? 'Empréstimo' : book.post_type === 'troca' ? 'Troca' : book.post_type}
            </Text>   
            </View>
          </View>
        </View>
        <View style={{ width: "90%", marginBottom: 20 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: "#335c67",
              marginBottom: 5,
              alignSelf: "center",
              marginVertical: 10
            }}
          >
            Avalie esta publicação:
          </Text>
          <View style={{ flexDirection: "row", marginVertical: 10, justifyContent: "center", }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={28}
                  color="#E09F3E"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
