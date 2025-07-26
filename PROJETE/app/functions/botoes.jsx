import React from "react";
import {TouchableOpacity, Text, View, StyleSheet} from "react-native";

export default function Botao({aoApertar, texto}){
    return(
        <View  style={{ marginTop: 10 }}>
<TouchableOpacity
        onPress={aoApertar}
        style ={styles.button}

      >
                  <Text style={styles.text}>{texto}</Text>

      </TouchableOpacity>
      </View>
    );
}

const styles = StyleSheet.create({
  button: {
        backgroundColor: "#335C67",
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 30,
  },
  text: {
    color: "#F5F5F5",
    fontSize: 16,
    textAlign: "center",
  },
});
