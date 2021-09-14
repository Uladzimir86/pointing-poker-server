import { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router'
import GameSettings from './components/game-settings/game-settings.component'
import Issues from './pages/lobby/issues';
import Footer from './UI-components/footer/footer'
import Header from './UI-components/header/header'

function App() {
  const [arrOfIssues, setArrOfIssues] = useState([{createButton: true}]);
  const issue =  {
    deleteButton: true,
    editButton: true,
    priority: 'low',
    number: '98',
  }
  // update issue
  async function resp(){
    const id=1;
    await fetch(`http://localhost:4000/issues?id=${id}`,{
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(issue)
    })
    .then((res) => res.json())
    // .then((res)=>console.log(res))
    .then((re) => setArrOfIssues([...re, ...arrOfIssues]));
  }
useEffect(() => {
  resp();
},[]);
//   // delete issue
//   async function resp(){
//     const id=1;
//     await fetch(`http://localhost:4000/issues?id=${id}`,{
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json;charset=utf-8'
//       },
//     })
//     .then((res) => res.json())
//     // .then((res)=>console.log(res))
//     .then((re) => setArrOfIssues([...re, ...arrOfIssues]));
//   }
//  // create issue
// useEffect(() => {
//   resp();
// },[]);
//   async function resp(){
//     await fetch('http://localhost:4000/issues?g=1',{
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json;charset=utf-8'
//       },
//       body: JSON.stringify(issue)
//     })
//     .then((res) => res.json())
//     // .then((res)=>console.log(res))
//     .then((re) => setArrOfIssues([...re, ...arrOfIssues]));
//   }
//  // receive issue
// useEffect(() => {
//   resp();
// },[]);
//   async function resp(){
//     await fetch('http://localhost:4000/issues')
//     .then((res) => res.json())
//     .then((res) => setArrOfIssues([...res, ...arrOfIssues]));
//   }
// useEffect(() => {
//   resp();
// },[]);
// console.log(arrOfIssues)
  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path="/">
          <h1> Ya main stranica</h1>
          <Issues arrOfIssues={arrOfIssues}/>
        </Route>
        <Route exact path="/lobby">
          <GameSettings />
        </Route>
      </Switch>
      <Footer />
    </div>
  )
}

export default App
