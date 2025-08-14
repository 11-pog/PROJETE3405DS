import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import Botao from '../../functions/botoes';
import { navigate } from 'expo-router/build/global-state/routing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MeuInput from '../../functions/textBox';


export default function Editar() {
    return(

      <View style={styles.container}>
        

      <MeuInput label={'Nome de usuário: '} />
      
            <MeuInput label={'Email: '}   />
      
            <MeuInput label={'Senha: '}  />

            <MeuInput label={'Cidade: '}  />
      <Botao texto="Salvar" aoApertar={() => {}} />

    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    paddingTop: 40,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  

  
});   