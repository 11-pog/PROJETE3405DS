import React from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { navigate } from "expo-router/build/global-state/routing";
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", //essa linha e a de baixo é pra deixar no meio 
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#335C67",
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginVertical: 10,
    shadowColor: '#1c292cff',
    shadowOffset: {
      width: 1,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#F5F5F5",
    fontSize: 16,
    textAlign: "center",
  },
  slogan: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9E2A2B",
    textAlign: "center",
    marginTop: 30,
  },
});

const DisplayAnImage = () => (
  <Image
    style={styles.logo}
    source={require('./img/logo.png')}
  />
);

export default function Inicial() {
  
  function GoToLogin() {
    navigate('/pages/login/Login');
  }

  function GoToCadastrar() {
    navigate('/pages/cadastrar/cadastrar');
  }

  return (
    <SafeAreaView style={styles.container}>
      <DisplayAnImage />

      {/* Botões*/}
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity onPress={GoToLogin} style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={GoToCadastrar} style={styles.button}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      {/* Slogan */}
      <Text style={styles.slogan}>
        Troque livros,{"\n"}troque ideias,{"\n"}toque o mundo.
      </Text>
    </SafeAreaView>
  );
}
