import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function HomePage() {
  const router = useRouter();

  // Load fonts
  const [loaded] = useFonts({
    PoppinsRegular: require("./assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("./assets/fonts/Poppins-Bold.ttf"),
  });
  if (!loaded) return null;

  // 1️⃣ Today's date auto-selected
  const today = new Date().toISOString().split("T")[0];

  const [noteText, setNoteText] = useState("");
  const [noteImage, setNoteImage] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const data = await AsyncStorage.getItem(today);
    setNotes(data ? JSON.parse(data) : []);
  };

  const saveNotes = async (newNotes) => {
    setNotes(newNotes);
    await AsyncStorage.setItem(today, JSON.stringify(newNotes));
  };

  // 2️⃣ Function to get current time in HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 3️⃣ Add note with auto time
  const addNote = async () => {
    if (!noteText && !noteImage) return;
    const newNote = {
      text: noteText,
      imageUri: noteImage,
      completed: false,
      time: getCurrentTime(), // attach current time
    };
    saveNotes([...notes, newNote]);
    setNoteText("");
    setNoteImage(null);
  };

  const deleteNote = (index) => {
    saveNotes(notes.filter((_, i) => i !== index));
  };

  const toggleComplete = (index) => {
    const updatedNotes = [...notes];
    updatedNotes[index].completed = !updatedNotes[index].completed;
    saveNotes(updatedNotes);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setNoteImage(result.assets[0].uri);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f9f9f9" }}>
      <Text style={{ fontFamily: "PoppinsBold", fontSize: 18, marginBottom: 10 }}>Today's Notes</Text>

      <TextInput
        placeholder="Write a note..."
        value={noteText}
        onChangeText={setNoteText}
        style={{
          fontFamily: "PoppinsRegular",
          fontSize: 14,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      />

      {noteImage && (
        <Image
          source={{ uri: noteImage }}
          style={{ width: "100%", height: 150, borderRadius: 10, marginBottom: 10 }}
        />
      )}

      <Button title="Pick Image" onPress={pickImage} />
      <Button title="Add Note" onPress={addNote} />

      <FlatList
        data={notes}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Card
            style={{
              marginVertical: 5,
              padding: 10,
              borderRadius: 10,
              backgroundColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "PoppinsRegular",
                    fontSize: 14,
                    textDecorationLine: item.completed ? "line-through" : "none",
                  }}
                >
                  {item.text}
                </Text>
                {/* 4️⃣ Show note creation time */}
                <Text style={{ fontFamily: "PoppinsRegular", fontSize: 12, color: "gray", marginTop: 2 }}>
                  {item.time}
                </Text>
              </View>

              <Icon
                name={item.completed ? "check-circle" : "radio-button-unchecked"}
                size={22}
                color={item.completed ? "green" : "gray"}
                onPress={() => toggleComplete(index)}
              />

              <Icon
                name="delete"
                size={22}
                color="red"
                onPress={() => deleteNote(index)}
                style={{ marginLeft: 10 }}
              />
            </View>

            {item.imageUri && (
              <Image
                source={{ uri: item.imageUri }}
                style={{ width: "100%", height: 150, marginTop: 10, borderRadius: 10 }}
              />
            )}
          </Card>
        )}
      />

      <Button title="Go to Calendar" onPress={() => router.push("/calendar")} />
    </ScrollView>
  );
}