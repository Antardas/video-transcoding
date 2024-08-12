import { useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import VideoFeed from './components/VideoFeed/VideoFeed';
import './App.css';
import Header from './components/Header/Header';
import Upload from './components/Upload/Upload';
import { socketService } from './services/socket.service';
import VideoWithInfo from './components/VideoFeed/VideoWithInfo';
function App() {
	const isRendered: React.MutableRefObject<boolean> = useRef<boolean>(false);
	useEffect(() => {
		socketService.setupSocketConnection();
		if (isRendered.current) {
			return;
		} else {
			isRendered.current = true;
		}
		return () => {
			if (socketService.socket?.connected) {
				
				socketService.socket.close();
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
					<Route path="/videos/:id" element={<VideoWithInfo />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
