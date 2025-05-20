
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequestGenerator } from './RequestGenerator';

export const ImprovedRequestGenerator: React.FC = () => {
  return (
    <div>
      <RequestGenerator />
    </div>
  );
};
