// FILE PATH: src/pages/Desk/DeskPage.tsx
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCinematic }     from '../../contexts/CinematicContext';
import { useAuth }          from '../../contexts/AuthContext';
import { CinematicEngine }  from '../../components/cinematic/engine/CinematicEngine';
import { DeskCalendar }     from '../../components/desk/calendar/DeskCalendar';
import { DepartmentDoors }  from '../../components/desk/departments/DepartmentDoors';
import { ContentGeneratorForm } from '../../components/desk/ContentGeneratorForm';
import { QuickStats }       from '../../components/desk/QuickStats';
import { NextStepBanner }   from '../../components/common/NextStepBanner';
import type { GeneratedArtifact, GenerationRequest } from '../../types';
import { ACTIVE_PLATFORMS, getXPProgress } from '../../lib/constants';
import { Zap, LayoutGrid, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type DeskView = 'desk' | 'departments';

const WHAT_TO_EXPECT_KEY = '
