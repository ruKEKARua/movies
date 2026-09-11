import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { store } from './store/store.ts'

import { GoogleOAuthProvider } from '@react-oauth/google';

const container = document.getElementById('root')

if (container) {
    const root = createRoot(container)

    root.render(
        <StrictMode>
            <GoogleOAuthProvider clientId="456996201218-olrdps98q9g3376qi35vudmo7u7iu1hn.apps.googleusercontent.com">
                <Provider store={store}>
                    <App />
                </Provider>
            </GoogleOAuthProvider>
        </StrictMode>
    )
} else {
    throw new Error(
        "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
    )
}