import React, { useEffect, useState } from 'react';
// import _ from 'lodash';
import { Popconfirm } from '@bytedesign/web-react';
import {
  IconPlusCircle,
  IconCloseCircleFill,
} from '@bytedesign/web-react/icon';
import { safeGet } from 'util/safeGet';
import { useStore } from 'global.model';

interface ProcessCRUDProps {
  services?: Array<{ id: string; name: string; key?: string }>;
  [key: string]: any;
}

safeGet('abc.d', { a: 1 });

const ProcessCRUD = (props: ProcessCRUDProps) => {
  const { isEdit, visible, services } = props;
  const [state, actions] = useStore('AutoServiceCartModel');
  const [pServices, setPServices] = useState(safeGet('selectedASs', state, []));
  // 保持待编辑的process自有原子服务
  const [dServices, setDServices] = useState(services);

  useEffect(() => {
    if (Array.isArray(state.selectedASs)) {
      setPServices(state.selectedASs);
    }
  }, [state.selectedASs]);

  useEffect(() => {
    if (Array.isArray(services)) {
      setDServices(services);
    }
  }, [services]);

  useEffect(() => {
    if (Array.isArray(dServices) && dServices.length > 0 && isEdit) {
      const tmp = dServices
        .filter(ser => Boolean(ser))
        .map((ser: { [key: string]: any }) => {
          const { name } = ser;
          const attrs = _.mapValues(
            _.keyBy(safeGet('attributes.nodes', ser, {}), 'key'),
            'value',
          );
          return {
            name,
            title: ser.title || attrs.title || name,
          };
        });
      actions.setState({
        selectedASs: tmp,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dServices, services]);

  useEffect(() => {
    if (visible) {
      setDServices(services);
    } else {
      setDServices([]);
      setPServices([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    return () => {
      setDServices([]);
      setPServices([]);
    };
  }, []);

  return (
    <div>
      <div
        className="process-crud-box"
        style={{
          width: `${160 +
            (Array.isArray(pServices) ? pServices.length * 170 : 0)}px`,
        }}
      >
        <i className="fe front">开始</i>
        {Array.isArray(pServices) &&
          pServices.length > 0 &&
          pServices.map((p: { [key: string]: any }, idx: number) => (
            <div
              className="p-node"
              // eslint-disable-next-line react/no-array-index-key
              key={`${idx}*${p.id}`}
              style={{
                width: 170,
              }}
            >
              <i className="l" />
              <IconPlusCircle
                style={{
                  position: 'absolute',
                  left: 10,
                  top: 5,
                  fontSize: 20,
                  color: 'var(--primary-color)',
                }}
                onClick={() => {
                  actions.show({});
                  actions.setState({
                    operatorIdx: idx,
                  });
                }}
              />
              <Popconfirm
                title="确认删除"
                onConfirm={async () => {
                  pServices.splice(idx, 1);
                  await actions.setState({
                    selectedASs: [...pServices],
                  });
                }}
              >
                <div className="cont">
                  <IconCloseCircleFill
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      color: 'var(--system-orange)',
                    }}
                  />
                  <span className="n">
                    {safeGet(
                      'title',
                      p,
                      (safeGet('attributes.nodes', p, [{}])[0] &&
                        safeGet('attributes.nodes', p, [{}])[0].value) ||
                        p.name,
                    )}
                  </span>
                </div>
              </Popconfirm>
            </div>
          ))}
        <div className="p-node">
          <i className="l" />
          <IconPlusCircle
            style={{
              position: 'absolute',
              left: 10,
              top: 5,
              fontSize: 20,
              color: 'var(--primary-color)',
            }}
            onClick={() => {
              actions.show({});
              actions.setState({
                operatorIdx: -1, // 表明添加到尾部
              });
            }}
          />
        </div>
        <i className="fe end">结束</i>
      </div>
    </div>
  );
};

export default ProcessCRUD;
