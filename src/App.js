import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import MainSection from "./components/MainSection";
import SideBar from "./components/SideBar";
import { ThemeProvider } from "react-bootstrap";


function App() {
  return (
    <ThemeProvider>
      <Container fluid>
        <Row>
          <SideBar />
          <MainSection />
        </Row>
      </Container>
    </ThemeProvider>
  );
}

export default App;
