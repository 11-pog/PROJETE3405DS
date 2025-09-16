import React from 'react'
import { TextInput, View, Text, StyleSheet } from 'react-native'

export default function MeuInput({ label, valor, onChange, erro, mensagemErro }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
      placeholder="Escreva aqui..."
          placeholderTextColor="#333"
        value={valor}
        onChangeText={onChange}
        style={[
          styles.input,
          {
            borderWidth: 1,
            borderColor: erro ? 'red' : '#ccc'
          }
        ]}
      />
      {mensagemErro ? (
        <Text style={styles.erroTexto}>{mensagemErro}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  erroTexto: {
    color: 'red',
    fontSize: 13,
    marginTop: -4,
    marginBottom: 6
  }
})
