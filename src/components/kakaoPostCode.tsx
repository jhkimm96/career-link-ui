import React, { useEffect, useState } from 'react';
import { Button, TextField, Stack } from '@mui/material';

interface KakaoPostcodeProps {
  onAddressSelect?: (address: string, postcode: string) => void;
}

declare global {
  interface Window {
    daum: any;
  }
}

const KakaoPostcode: React.FC<KakaoPostcodeProps> = ({ onAddressSelect }) => {
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.daum && window.daum.Postcode) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);
  const handleSearch = () => {
    if (!scriptLoaded || !window.daum?.Postcode) {
      alert('주소 검색 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';
        const postcode = data.zonecode;

        if (data.addressType === 'R') {
          if (data.bname) extraAddress += data.bname;
          if (data.buildingName)
            extraAddress += extraAddress ? `, ${data.buildingName}` : data.buildingName;
          fullAddress += extraAddress ? ` (${extraAddress})` : '';
        }

        setAddress(fullAddress);
        setPostcode(postcode);
        if (onAddressSelect) {
          onAddressSelect(fullAddress, postcode);
        }
      },
    }).open();
  };

  return (
    <div>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ width: '100%', alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <TextField
          label="도로명+지번 주소 검색"
          value={address}
          disabled
          style={{ width: '330px', marginRight: '10px' }}
        />
        <TextField
          label="우편번호"
          value={postcode}
          disabled
          style={{ width: '100px', marginRight: '10px' }}
        />
        <Button variant="outlined" color="primary" onClick={handleSearch}>
          주소 검색
        </Button>
      </Stack>
    </div>
  );
};

export default KakaoPostcode;
