'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, ChevronRight } from 'lucide-react';
import { ROUND_CONFIGS, type DocumentType } from '@/lib/game-types';

interface DocumentPanelProps {
  currentRound: number;
  onSubmit: (documentType: DocumentType, content: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export default function DocumentPanel({ currentRound, onSubmit, isSubmitting }: DocumentPanelProps) {
  const config = ROUND_CONFIGS.find((r) => r.round === currentRound);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [direction, setDirection] = useState<1 | -1>(1);

  const updateField = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCheckboxGroup = useCallback((key: string, option: string, checked: boolean) => {
    setFormData((prev) => {
      const current = (prev[key] as string[]) || [];
      if (checked) {
        return { ...prev, [key]: [...current, option] };
      }
      return { ...prev, [key]: current.filter((v) => v !== option) };
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    onSubmit(config.documentType, formData);
  };

  // Reset form when round changes
  const resetFormForRound = () => {
    setFormData({});
  };

  // Watch for round changes
  const prevRound = useState(currentRound);
  if (prevRound[0] !== currentRound) {
    prevRound[1](currentRound);
    setDirection(currentRound > prevRound[0] ? 1 : -1);
    resetFormForRound();
  }

  if (!config) return null;

  return (
    <Card className="h-full flex flex-col border-amber-200 bg-white/90 backdrop-blur-sm shadow-lg">
      <div className="px-4 py-3 border-b border-amber-200 bg-amber-50/80 rounded-t-xl">
        <h2 className="font-semibold text-amber-900 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Official Paperwork
        </h2>
        <p className="text-xs text-amber-600 mt-0.5">Round {currentRound} — {config.title}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentRound}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="mb-4">
              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 mb-2">
                {config.documentType}
              </Badge>
              <p className="text-sm text-amber-700">{config.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {config.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  {field.type === 'text' && (
                    <>
                      <Label htmlFor={field.key} className="text-amber-800 font-medium text-sm">
                        {field.label}
                      </Label>
                      <Input
                        id={field.key}
                        value={(formData[field.key] as string) || ''}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </>
                  )}

                  {field.type === 'textarea' && (
                    <>
                      <Label htmlFor={field.key} className="text-amber-800 font-medium text-sm">
                        {field.label}
                      </Label>
                      <Textarea
                        id={field.key}
                        value={(formData[field.key] as string) || ''}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="border-amber-200 focus:border-amber-500 focus:ring-amber-500 min-h-[80px]"
                      />
                    </>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="flex items-start space-x-3 pt-1">
                      <Checkbox
                        id={field.key}
                        checked={(formData[field.key] as boolean) || false}
                        onCheckedChange={(checked) => updateField(field.key, !!checked)}
                        className="border-amber-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <Label htmlFor={field.key} className="text-amber-800 font-medium text-sm cursor-pointer leading-none pt-0.5">
                        {field.label}
                      </Label>
                    </div>
                  )}

                  {field.type === 'checkbox-group' && field.options && (
                    <>
                      <Label className="text-amber-800 font-medium text-sm">
                        {field.label}
                      </Label>
                      <div className="space-y-2 mt-1">
                        {field.options.map((option) => {
                          const selected = ((formData[field.key] as string[]) || []).includes(option);
                          return (
                            <div key={option} className="flex items-start space-x-3">
                              <Checkbox
                                id={`${field.key}-${option}`}
                                checked={selected}
                                onCheckedChange={(checked) =>
                                  handleCheckboxGroup(field.key, option, !!checked)
                                }
                                className="border-amber-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                              />
                              <Label
                                htmlFor={`${field.key}-${option}`}
                                className="text-amber-800 text-sm cursor-pointer leading-none pt-0.5"
                              >
                                {option}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))}

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-11 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit Document
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}
