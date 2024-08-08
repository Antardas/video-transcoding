import VideoFeed from './components/VideoFeed/VideoFeed';
import './App.css';
import Header from './components/Header/Header';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Upload from './components/Upload/Upload';
import { useEffect } from 'react';
function App() {
	useEffect(() => {
		const userId = localStorage.getItem('userId');
		if (!userId) {
			localStorage.setItem('userId', self.crypto.randomUUID());
		}
	}, []);
	return (
		<div>
			<BrowserRouter>
				<Header />
				<Routes>
					<Route path="/" element={<VideoFeed />} />
					<Route path="/upload" element={<Upload />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
