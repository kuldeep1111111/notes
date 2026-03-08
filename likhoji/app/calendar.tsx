import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function CalendarPage() {
  const router = useRouter();

  // Fonts
  const [loaded] = useFonts({
    PoppinsRegular: require("./assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("./assets/fonts/Poppins-Bold.ttf"),
  });
  if (!loaded) return null;

  // 1️⃣ Default today date
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today); // auto today selected
  const [noteText, setNoteText] = useState("");
  const [noteImage, setNoteImage] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotes(selectedDate);
  }, [selectedDate]);

  const loadNotes = async (date) => {
    const data = await AsyncStorage.getItem(date);
    setNotes(data ? JSON.parse(data) : []);
  };

  const saveNotes = async (newNotes) => {
    setNotes(newNotes);
    await AsyncStorage.setItem(selectedDate, JSON.stringify(newNotes));
  };

  // 2️⃣ Get current time function
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 3️⃣ Add note with current time
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
      {/* Calendar with today auto-selected */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true } }}
      />

      <TextInput
        placeholder="Write note for this date..."
        value={noteText}
        onChangeText={setNoteText}
        style={{
          fontFamily: "PoppinsRegular",
          fontSize: 14,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginVertical: 10,
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

      <Button title="Back to Home" onPress={() => router.push("/")} />
    </ScrollView>
  );
}