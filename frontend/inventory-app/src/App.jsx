
import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router'
import Root from './utils/Root'
import Login from './pages/Login'
import ProtectedRoutes from './utils/ProtectedRoutes'
import Dashboard from './pages/Dashboard'
import MemberList from './components/MemberList'
import ProjectDashboard from './components/ProjectDashboard'
import ProjectDetails from './components/ProjectDetails'
import ShareIssueList from './components/ShareIssueList'
import ProjectWithShares from './components/ShareSalesList'
import GlobalInvestmentTable from './components/EndPoints'
import ProfitManagement from './components/ProfitManagement'
import ProfitDetailsPage from './components/ProfitDetailsPage'
import Profile from './components/Profile'
import MainDashboard from './components/MainDashboard'
import MemberDashboard from './components/memberComponents/MemberDashboard'
import MemberShares from './components/memberComponents/MemberShares'
import MyProfit from './components/memberComponents/MyProfit'
import MyLedger from './components/memberComponents/MyLedger'

function App() {
  
  return (
    <>
      <Router>
          <Routes>
              <Route path='/' element={<Root/>}/>
              <Route 
                path='/admin-dashboard' 
                element={
                  <ProtectedRoutes requireRole={["admin"]}>
                      <Dashboard/>
                  </ProtectedRoutes>
                  }
              >
                <Route
                  index
                  element={<MainDashboard/>}
                />
                <Route
                  path='profile'
                  element={
                    <Profile/>
                  }
                />
                 <Route
                  path='members'
                  element={
                    <MemberList/>
                  }
                />
                 <Route
                  path='ledger'
                  element={
                    <h1>Ledger</h1>
                  }
                />
                
                 <Route
                  path='projects'
                  element={
                    <ProjectDashboard/>
                  }
                />

                {/* আইডি অনুযায়ী পেজ */}
                <Route 
                  path="projects/:id" 
                  element={<ProjectDetails />}
                  
                /> 


                <Route
                  path='shares'
                  element={
                    <ShareIssueList/>
                  }
                />
                 <Route
                  path='share-sales'
                  element={
                   <ProjectWithShares/>
                  }
                />
                <Route
                  path='endpoints'
                  element={
                    <GlobalInvestmentTable/>
                  }
                />
                <Route
                  path='profit'
                  element={
                    <ProfitManagement/>
                  }
                />
                <Route 
                  path="profit/details/:id" 
                  element={<ProfitDetailsPage />

                  } 
                  />

                <Route
                  path='reports'
                  element={
                    <h1>Reports</h1>
                  }
                />
                 <Route
                  path='activities'
                  element={
                    <h1>Activities</h1>
                  }
                />
                 <Route
                  path='system-settings'
                  element={
                    <h1>System Settings</h1>
                  }
                />
                
              </Route>
              <Route path='/boardMember-dashboard' element={<h1>BoardMember Dashboard</h1>}/>
              <Route path='/member-dashboard' 
                element={
                <ProtectedRoutes requireRole={["member"]}>
                     <Dashboard/>
                  </ProtectedRoutes>
                }
              >
              <Route
                  index
                  element={<MemberDashboard/>}
              />
              <Route
                  path='profile'
                  element={
                      <Profile/>
                  }
                />
                <Route
                  path='ledger'
                  element={
                    <MyLedger/>
                  }
                />
                <Route
                  path='projects'
                  element={
                   <h1>My Projects</h1>
                  }
                />
                 <Route
                  path='shares'
                  element={
                    <MemberShares/>
                  }
                />
                <Route
                  path='profit'
                  element={
                   <MyProfit/>
                  }
                />

             </Route>
              <Route path='/login' element={<Login/>}/>
              <Route path='/unauthorized' element={<h1>Unauthorized</h1>}/>

          </Routes>
      </Router>
    </>
  )
}

export default App
