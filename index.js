import React from 'react'
import ReactDOM from 'react-dom'
import { Frame } from 'chrome-sidebar'
import './sidebar.component'
import './App'

const viewport = document.getElementById('viewport');
const app = document.createElement('div');
app.id = 'root';
if (viewport) viewport.prepend(app);
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

/*
if (Frame.isReady()) {
    Frame.toggle()
} else {
    boot()
}

function boot() {
    const root = document.createElement('div')
    document.body.appendChild(root)

    const App = (
        <Frame url="http://google.com"/>
    )

    ReactDOM.render(App, root)
}
*/