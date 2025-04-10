const initial = 250;
const modifiedInitial = 250 + 10;

describe('getValidateInputText', () => {
  // Función de utilidad reutilizable para crear eventos mock
  const createMockEvent = (value: string | null | undefined): Event =>
    ({
      target: { value },
    } as unknown as Event);

  // Función de configuración reutilizable
  const setupTest = (limit: number) => {
    jest.resetModules();
    jest.doMock('../../constants/limit-text-input', () => ({
      LIMIT_TEXT_INPUT: limit,
    }));
    return require('./get-validate-input-text').getValidateInputText;
  };

  beforeEach(() => {
    jest.resetModules();
  });

  describe('Empty/Null/Undefined Input Handling', () => {
    const testCases = [
      { description: 'empty string', value: '' },
      { description: 'null', value: null },
      { description: 'undefined', value: undefined },
    ];

    testCases.forEach(({ description, value }) => {
      it(`should return no change for ${description} input`, () => {
        const getValidateInputText = setupTest(initial);
        const event = createMockEvent(value);
        expect(getValidateInputText(event)).toEqual({ change: false });
      });
    });
  });

  describe('Values more than constants LIMIT_TEXT_INPUT', () => {
    it('should return no change for -10', () => {
      const getValidateInputText = setupTest(initial);
      const event = createMockEvent('-10');
      expect(getValidateInputText(event)).toEqual({ change: false });
    });

    it('should return no change for -25.75', () => {
      const getValidateInputText = setupTest(initial);
      const event = createMockEvent('-25.75');
      expect(getValidateInputText(event)).toEqual({ change: false });
    });

    it(`should return true change split 0 to ${initial} characters of original string of ${modifiedInitial} characteres`, () => {
      const getValidateInputText = setupTest(initial);
      const event = createMockEvent('x'.repeat(modifiedInitial));
      expect(getValidateInputText(event)).toEqual({
        change: true,
        value: 'x'.repeat(initial),
      });
    });

    it('should return false change because limit is negative', () => {
      const getValidateInputText = setupTest(-1);
      const event = createMockEvent('-25.75');
      expect(getValidateInputText(event)).toEqual({ change: false });
    });
  });
});
