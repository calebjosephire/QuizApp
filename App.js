
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Button, ButtonGroup } from "react-native-elements";

const Stack = createNativeStackNavigator();

const QUESTIONS = [
  {
    prompt: "When was the Tampa Bay Buccaneers last Super Bowl win?",
    type: "multiple-choice",
    choices: ["2002", "2016", "2021", "2024"],
    correct: 2,
  },
  {
    prompt:
      "When did the Tampa Bay Lightning win the Stanley Cup? (Select all that apply)",
    type: "multiple-answer",
    choices: ["2004", "2019", "2020", "2021"],
    correct: [0, 2, 3],
  },
  {
    prompt:
      "The Tampa Bay Buccaneers have won more Super Bowls than the Tampa Bay Lightning.",
    type: "true-false",
    choices: ["True", "False"],
    correct: 0,
  },
];

function QuestionScreen({ route, navigation }) {
  const { data, index, answers } = route.params;
  const question = data[index];
  const isMulti = question.type === "multiple-answer";

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[index] = isMulti ? selectedIndexes : selectedIndex;

    if (index === data.length - 1) {
      navigation.replace("Summary", { data, answers: newAnswers });
    } else {
      navigation.replace("Question", {
        data,
        index: index + 1,
        answers: newAnswers,
      });
    }
  };

  const canContinue = isMulti
    ? selectedIndexes.length > 0
    : selectedIndex !== null;

  return (
    <LinearGradient colors={["#1E3A8A", "#0F172A"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.inner}>
          <Text style={styles.header}>Question {index + 1}</Text>

          <View style={styles.card}>
            <Text style={styles.prompt}>{question.prompt}</Text>

            <ButtonGroup
              testID="choices"
              vertical
              buttons={question.choices}
              onPress={(value) => {
                if (isMulti) {
                  if (selectedIndexes.includes(value)) {
                    setSelectedIndexes(
                      selectedIndexes.filter((i) => i !== value)
                    );
                  } else {
                    setSelectedIndexes([...selectedIndexes, value]);
                  }
                } else {
                  setSelectedIndex(value);
                }
              }}
              selectedIndex={isMulti ? undefined : selectedIndex}
              selectedIndexes={isMulti ? selectedIndexes : undefined}
              containerStyle={{
                width: "100%",
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "#3B82F6",
                backgroundColor: "rgba(255,255,255,0.1)",
                marginBottom: 20,
              }}
              buttonStyle={{
                backgroundColor: "rgba(255,255,255,0.15)",
                paddingVertical: 16,
              }}
              selectedButtonStyle={{
                backgroundColor: "#3B82F6",
              }}
              textStyle={{
                color: "#E2E8F0",
                fontSize: 18,
                fontWeight: "600",
              }}
              selectedTextStyle={{
                color: "white",
                fontWeight: "800",
              }}
            />
          </View>

          <Button
            testID="next-question"
            title={index === data.length - 1 ? "Finish" : "Next"}
            onPress={handleNext}
            disabled={!canContinue}
            buttonStyle={styles.button}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SummaryScreen({ route }) {
  const { data, answers } = route.params;

  const { score, detail } = useMemo(() => {
    let total = 0;

    const detail = data.map((q, i) => {
      const user = answers[i];
      let correct = false;

      if (Array.isArray(q.correct)) {
        const correctSet = new Set(q.correct);
        const userSet = new Set(Array.isArray(user) ? user : []);
        correct =
          correctSet.size === userSet.size &&
          [...correctSet].every((x) => userSet.has(x));
      } else {
        correct = user === q.correct;
      }

      if (correct) total += 1;

      return { q, user, correct };
    });

    return { score: total, detail };
  }, [data, answers]);

  return (
    <LinearGradient colors={["#1E3A8A", "#0F172A"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner}>
          <Text testID="total" style={styles.header}>
            Score: {score} / {data.length}
          </Text>

          {detail.map((item, i) => (
            <View key={i} style={styles.summaryBlock}>
              <Text style={styles.summaryTitle}>
                Question {i + 1} — {item.correct ? "Correct" : "Incorrect"}
              </Text>
              <Text style={styles.prompt}>{item.q.prompt}</Text>

              {item.q.choices.map((c, idx) => {
                const isCorrect = Array.isArray(item.q.correct)
                  ? item.q.correct.includes(idx)
                  : item.q.correct === idx;

                const isSelected = Array.isArray(item.user)
                  ? item.user.includes(idx)
                  : item.user === idx;

                let style = styles.choiceText;

                if (isCorrect) {
                  style = { ...style, fontWeight: "bold", color: "#16A34A" };
                }
                if (isSelected && !isCorrect) {
                  style = {
                    ...style,
                    textDecorationLine: "line-through",
                    color: "#DC2626",
                  };
                }

                return (
                  <Text key={idx} style={style}>
                    - {c}
                  </Text>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Question"
          component={QuestionScreen}
          initialParams={{ data: QUESTIONS, index: 0, answers: [] }}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Summary"
          component={SummaryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },

  header: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 20,
    textAlign: "center",
    color: "#F8FAFC",
    letterSpacing: 1,
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  prompt: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
    color: "#F8FAFC",
    lineHeight: 30,
  },

  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  summaryBlock: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  summaryTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    color: "#F8FAFC",
  },

  choiceText: {
    fontSize: 18,
    marginLeft: 10,
    marginBottom: 6,
    color: "#E2E8F0",
  },
});
