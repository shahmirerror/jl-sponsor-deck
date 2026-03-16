import Navbar from '../Navbar';
import Footer from '../Footer';

const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>{children}</main>
      <Footer />
    </>
  );
};

export default PublicLayout;
