import { createStackNavigator } from "@react-navigation/stack";
import About from "../../frontend/screens/About";

const aboutStack = createStackNavigator();

function App() {
    return (
        <aboutStack.Navigator>
          <aboutStack.Screen name="About" component={About} />
        </aboutStack.Navigator>

    );
  }

  export default App;