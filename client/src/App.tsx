import { useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import VideoFeed from './components/VideoFeed/VideoFeed';
import './App.css';
import Header from './components/Header/Header';
import Upload from './components/Upload/Upload';
import { socketService } from './services/socket.service';
function App() {
	const isRendered: React.MutableRefObject<boolean> = useRef<boolean>(false);
	useEffect(() => {
		if (isRendered.current) {
			socketService.setupSocketConnection();
			return;
		} else {
			isRendered.current = true;
		}
		return () => {
			if (socketService.socket) {
				
				// socketService.socket.close();
			}
		};
	}, []);

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
