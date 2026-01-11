import React, { useState, useEffect } from 'react';
import './App.css';
import { animated, useTransition } from '@react-spring/web';

function App() {
  const [cards, setCards] = useState([]);
  const [counter, setCounter] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const userName = process.env.REACT_APP_USER_NAME || Object.keys(cards)[0];
  const scrollInterval = parseInt(process.env.REACT_APP_SCROLL_INTERVAL || '5');
  const refreshInterval = parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '300');

  let height = 0;
  const transitions = useTransition(
    cards.map(data => ({ ...data, y: (height += data.height) - data.height })),
    {
      key: d => d.fields[0],
      from: { height: 0, opacity: 1 },
      leave: { height: 0, opacity: 1 },
      enter: ({ y, height }) => ({ y, height, opacity: 1 }),
      update: ({ y, height }) => ({ y, height })
    }
  );

  const updateCards = () => {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const user = userName || Object.keys(data)[0];
        if (data[user]) {
          setCards(
            data[user].map(card => ({
              fields: card.map(x => x.replace(/<img .*?>/g, "")),
              y: 0,
              height: 200
            }))
          );
        }
      })
      .catch(error => console.error('Error fetching cards:', error));
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCounter(counter => {
        if (counter === refreshInterval) {
          updateCards();
          return 0;
        } else if (counter % scrollInterval === 0) {
          setCards(cards => {
            if (cards.length === 0) return cards;
            const poppedCard = cards.pop();
            return [{ ...poppedCard }, ...cards];
          });
        }
        return counter + 1;
      });
    }, 1000);

    updateCards();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="header">
        <button
          className="theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle theme"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <h1>
          {[...Array((4 + counter) % 5)].map((_, i) => <span key={i}>.</span>)}
          Refresh in {refreshInterval - counter}
        </h1>
      </div>
      <div className="list" style={{ height }}>
        {transitions((props, item, _, index) => {
          const { y, ...rest } = props;
          return (
            <animated.div
              key={item.fields[0]}
              className="card"
              style={{
                zIndex: cards.length - index,
                transform: y.to(y => `translate3d(0,${y}px,0)`),
                ...rest
              }}
            >
              <h2 dangerouslySetInnerHTML={{ __html: item.fields[0] }}></h2>
              <div dangerouslySetInnerHTML={{ __html: item.fields.slice(1).join('<br/>') }}></div>
            </animated.div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
