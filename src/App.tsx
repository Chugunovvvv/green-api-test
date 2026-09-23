import { ChatPage } from "./components/ChatPage/ChatPage";
import { CredentialsForm } from "./components/CredentialsForm/CredentialsForm";
import { useChatStore } from "./store/chatStore";

function App() {
    const isConnected = useChatStore(state => state.credentials !== null);

    if (!isConnected) {
        return <CredentialsForm />;
    }

    return <ChatPage />;
}

export default App;
