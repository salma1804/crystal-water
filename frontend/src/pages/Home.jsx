import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Categories from '../components/Categories.jsx';

import Gallery from '../components/Gallery.jsx';
import Process from '../components/Process.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';
import Seo from '../components/Seo.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import ApprovedReviews from '../components/ApprovedReviews.jsx';

export default function Home() {
  const navigate = useNavigate();

  const handleQuizRecommend = (catValue) => {
    navigate(`/categorie/${catValue}`);
  };

  return (
    <>
      <Seo
        title="Traitement & Filtration d'Eau en Tunisie"
        description="Osmoseurs, adoucisseurs, cartouches filtrantes et équipements de traitement d'eau. Livraison en Tunisie, prix compétitifs, garantie incluse."
        image="https://www.crystalwater.tn/og-image.jpg"
      />
      <Hero />
      <ProductGrid />
      <Categories />
      <Gallery />
      <Process />
      <ApprovedReviews />
      <ReviewForm />
      <Contact />
      <Footer />
    </>
  );
}