import React, { useState } from 'react';

const talesData = [
  {
    title: 'The Origin of Kumbh Mela',
    summary: 'Discover how the sacred festival began and its spiritual significance.',
    content:
      'Kumbh Mela traces its origin to the ancient legend of the churning of the ocean (Samudra Manthan) by gods and demons. The nectar of immortality (Amrit) was spilled at four places, including Ujjain, making it a site for the holy gathering.',
    image: '/images/kumbh.jpg',
    link: '#',
  },
  {
    title: 'Mahakaleshwar: The Eternal Lord',
    summary: 'Learn about the legendary Mahakaleshwar temple and its role in Kumbh.',
    content:
      'Mahakaleshwar, one of the twelve Jyotirlingas, is believed to be the guardian of Ujjain. During Kumbh, pilgrims seek blessings here, and many tales recount miracles and divine interventions at this sacred site.',
    image: '/images/Ram_Ghat.jpg',
    link: '#',
  },
  {
    title: 'The Royal Bath (Shahi Snan)',
    summary: 'Experience the grandeur and rituals of the Shahi Snan procession.',
    content:
      'The Shahi Snan is a spectacular event where saints and Akharas lead a ceremonial bath in the holy river. It symbolizes spiritual cleansing and attracts millions of devotees.',
    image: '/images/kumbh1.png',
    link: '#',
  },
  {
    title: 'Saints and Akharas',
    summary: 'Meet the revered saints and their unique traditions at Mahakumbh.',
    content:
      'Mahakumbh is a convergence of various Akharas, each with its own customs, stories, and spiritual practices. Interacting with saints offers a glimpse into centuries-old wisdom.',
    image: '/images/swastik.svg',
    link: '#',
  },
];

const Tales = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (idx) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-8xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-amber-700 mb-10 text-center">
        Echoes of the Divine: Exploring the Heart of Mahakumbh
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {talesData.map((tale, idx) => (
          <div
            key={idx}
            className="group relative rounded-3xl bg-white/70 backdrop-blur-md shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden border border-white/40"
          >
            <div className="relative h-60 w-full overflow-hidden">
              <img
                src={tale.image}
                alt={tale.title}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 to-transparent z-10" />
              <h5
                className="absolute bottom-3 left-4 right-4 text-xl font-bold text-amber-900 z-20 drop-shadow-md"
                style={{ textShadow: '0 1px 6px rgba(255,255,255,0.7)' }}
              >
                {tale.title}
              </h5>
            </div>
            <div className="p-5 flex flex-col text-gray-900">
              <p className="text-amber-800 font-medium italic text-base mb-2">{tale.summary}</p>
              <p className="text-sm font-normal leading-relaxed text-gray-800">{tale.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tales;
