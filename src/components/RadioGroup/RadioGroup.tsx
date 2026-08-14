import { useId, useState, type ChangeEvent } from 'react';

import styles from './RadioGroup.module.scss';

export type RadioOption = Readonly<{
  value: string;
  label: string;
}>;

export type RadioGroupProps = Readonly<{
  options: readonly RadioOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  legend?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}>;

function RadioGroup({
  options,
  name,
  value,
  defaultValue,
  legend,
  disabled = false,
  onChange,
}: RadioGroupProps) {
  const groupId = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  const selectedValue = value ?? uncontrolledValue;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(nextValue);
  };

  return (
    <fieldset
      className={styles.radioGroup}
      name={name}
      aria-label={legend ? undefined : 'Radio group'}
      disabled={disabled}
    >
      {legend && <legend className={styles.legend}>{legend}</legend>}

      <div className={styles.options}>
        {options.map((option, index) => {
          const optionId = `${groupId}-${index}`;

          return (
            <label className={styles.option} htmlFor={optionId} key={`${option.value}-${index}`}>
              <input
                checked={selectedValue === option.value}
                id={optionId}
                name={name ?? groupId}
                onChange={handleChange}
                type="radio"
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default RadioGroup;
