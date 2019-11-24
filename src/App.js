import React, { useState, useEffect } from 'react';
import './App.css';
import { animated, useTransition } from 'react-spring'

function App() {
  const [cards, setCards] = useState([]);
  let height = 0;
  const transitions = useTransition(
    cards.map(data => ({ ...data, y: (height += data.height) - data.height })),
    d => d.fields[0],
    {
      from: { height: 0, opacity: 1 },
      leave: { height: 0, opacity: 1 },
      enter: ({ y, height }) => ({ y, height, opacity: 1 }),
      update: ({ y, height }) => ({ y, height })
    }
  )
  const [counter, setCounter] = useState(1);

  const updateCards = () => {
    fetch(process.env.REACT_APP_API_URL).then(response => {
      response.json().then(data => {
        setCards(data['kieran'].map(card => ({ fields: card.map(x => x.replace(/<img .*?>/g, "")), y: 0, height: 200 })))
      })
    })
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCounter(counter => {
        if (counter == 300) {
          updateCards();
          return 0;
        } else if (counter % 5 == 0) {
          setCards(cards => {
            const poppedCard = cards.pop();
            return [{ ...poppedCard }, ...cards];
          });
        }
        return counter + 1
      });
    }, 1000);
    updateCards();
    return () => {
      clearInterval(intervalId);
    };
  }, [])

  return (
    <div className="App">
      <h1 style={{ textAlign: 'right', width: '100%' }}>{[...Array((4+counter) % 5)].map(() => '.')} Refresh in {300 - counter}</h1>
      <div class="list" style={{ height }}>
        {transitions.map(({ item, props: { y, ...rest }, key }, index) => <animated.div
          key={key}
          class="card"
          style={{ zIndex: cards.length - index, transform: y.interpolate(y => `translate3d(0,${y}px,0)`), ...rest }}>
          <h2 dangerouslySetInnerHTML={{ __html: item.fields[0] }}></h2>
          <div dangerouslySetInnerHTML={{ __html: item.fields.slice(1) }}></div>
        </animated.div>
        )}
      </div>
    </div>
  );
}

export default App;
