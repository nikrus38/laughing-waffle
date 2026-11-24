import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../features/home/Home';
import './App.css';
function App() {
    return (_jsx(Router, { children: _jsx("div", { className: "App", children: _jsx(Routes, { children: _jsx(Route, { path: "/", element: _jsx(Home, {}) }) }) }) }));
}
export default App;
//# sourceMappingURL=App.js.map