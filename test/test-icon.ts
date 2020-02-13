import React, { FC, useCallback, useEffect, useState } from 'react';

import { Button } from '@bytedesign/web-react';
import { IconPlusCircle, IconAdd } from '@bytedesign/web-react/icon';
import _ from 'lodash';

const BackTop: FC<{
  el: HTMLDivElement | null;
}> = ({ el }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!el) return;
    const handler = _.debounce(() => setVisible(el.scrollTop > 100), 100);
    el.addEventListener('scroll', handler);
    return () => {
      el.removeEventListener('scroll', handler);
    };
  }, [el]);

  const scrollToTop = useCallback(() => {
    if (!el) {
      return;
    }
    el.scrollTop = 0;
  }, [el]);

  if (!visible || !el) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0.08rem',
        right: 0,
      }}
    >
      <Button
        type="dashed"
        style={{
          background: 'transparent',
          width: '0.24rem',
          height: '0.24rem',
          lineHeight: '0.24rem',
          padding: 0,
        }}
        onClick={scrollToTop}
      >
        <IconPlusCircle
          style={{
            color: 'var(--primary-color)',
            fontSize: '0.2rem',
            verticalAlign: 'middle',
            margin: 0,
          }}
        />
        <IconAdd style={{ height: 30 }}></IconAdd>
      </Button>
    </div>
  );
};

export default BackTop;
