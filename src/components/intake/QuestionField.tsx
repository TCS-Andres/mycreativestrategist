'use client';
import * as React from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Checkbox } from '@/components/ui/Checkbox';
import { FileDropzone, type UploadedFile } from './FileDropzone';
import type { Question } from '@/lib/questions';

interface Props {
  question: Question;
  control: Control<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  files: Record<string, UploadedFile[]>;
  onFilesChange: (questionId: string, files: UploadedFile[]) => void;
  draftId: string;
}

export function QuestionField({ question, control, errors, files, onFilesChange, draftId }: Props) {
  const error = errors[question.id]?.message as string | undefined;

  if (question.kind === 'upload') {
    return (
      <Field
        number={question.number}
        label={question.label}
        helper={question.helper}
        required={question.required}
      >
        <FileDropzone
          category={question.category!}
          accept={question.accept!}
          maxFiles={question.maxFiles ?? 1}
          maxSizeMb={question.maxSizeMb ?? 25}
          files={files[question.id] ?? []}
          submissionDraftId={draftId}
          onChange={(f) => onFilesChange(question.id, f)}
          label={question.label}
        />
      </Field>
    );
  }

  if (question.kind === 'longtext') {
    return (
      <Controller
        control={control}
        name={question.id}
        render={({ field }) => {
          const value = (field.value ?? '') as string;
          const len = value.length;
          return (
            <Field
              number={question.number}
              label={question.label}
              helper={question.helper}
              required={question.required}
              error={error}
              hint={len > 0 ? `${len.toLocaleString()} characters` : undefined}
            >
              <Textarea
                value={value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!error}
                rows={5}
                autoComplete="off"
                name={question.id}
                id={question.id}
              />
            </Field>
          );
        }}
      />
    );
  }

  if (question.kind === 'select') {
    return (
      <Controller
        control={control}
        name={question.id}
        render={({ field }) => (
          <Field
            number={question.number}
            label={question.label}
            helper={question.helper}
            required={question.required}
            error={error}
          >
            <Select
              value={(field.value ?? '') as string}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!error}
            >
              <option value="" disabled>
                Choose one
              </option>
              {question.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
      />
    );
  }

  if (question.kind === 'multiselect') {
    return (
      <Controller
        control={control}
        name={question.id}
        render={({ field }) => {
          const selected = (field.value ?? []) as string[];
          const toggle = (val: string) => {
            field.onChange(
              selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val],
            );
          };
          return (
            <Field
              number={question.number}
              label={question.label}
              helper={question.helper}
              required={question.required}
              error={error}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options?.map((opt) => (
                  <Checkbox
                    key={opt.value}
                    label={opt.label}
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                  />
                ))}
              </div>
            </Field>
          );
        }}
      />
    );
  }

  if (question.kind === 'slider') {
    return (
      <Controller
        control={control}
        name={question.id}
        render={({ field }) => {
          const v = typeof field.value === 'number' ? field.value : 5;
          return (
            <Field
              number={question.number}
              label={question.label}
              helper={question.helper}
              required={question.required}
              error={error}
            >
              <Slider
                min={question.min ?? 1}
                max={question.max ?? 10}
                step={question.step ?? 1}
                value={v}
                onChange={field.onChange}
                minLabel={question.minLabel}
                maxLabel={question.maxLabel}
              />
            </Field>
          );
        }}
      />
    );
  }

  // text, email, tel, url, number
  const inputType =
    question.kind === 'email'
      ? 'email'
      : question.kind === 'tel'
        ? 'tel'
        : question.kind === 'url'
          ? 'url'
          : question.kind === 'number'
            ? 'number'
            : 'text';

  return (
    <Controller
      control={control}
      name={question.id}
      render={({ field }) => (
        <Field
          number={question.number}
          label={question.label}
          helper={question.helper}
          required={question.required}
          error={error}
        >
          <Input
            type={inputType}
            value={(field.value ?? '') as string}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={question.placeholder}
            invalid={!!error}
            min={question.min}
            max={question.max}
            autoComplete={question.autoComplete}
            name={question.id}
            id={question.id}
          />
        </Field>
      )}
    />
  );
}
