import { useEffect } from 'react';

const FontLoader = () => {
  useEffect(() => {
    // Load Google Fonts CSS which will handle the font files automatically
    const link1 = document.createElement('link');
    link1.rel = 'preload';
    link1.as = 'style';
    link1.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';

    const link2 = document.createElement('link');
    link2.rel = 'preload';
    link2.as = 'style';
    link2.href =
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap';

    const stylesheet1 = document.createElement('link');
    stylesheet1.rel = 'stylesheet';
    stylesheet1.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';

    const stylesheet2 = document.createElement('link');
    stylesheet2.rel = 'stylesheet';
    stylesheet2.href =
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap';

    document.head.appendChild(link1);
    document.head.appendChild(link2);
    document.head.appendChild(stylesheet1);
    document.head.appendChild(stylesheet2);
  }, []);

  return null;
};

export default FontLoader;
