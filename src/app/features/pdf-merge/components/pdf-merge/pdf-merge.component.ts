import {
  AfterViewInit,
  Component,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MessagesComponent } from '../../../../shared/components/messages/messages.component';
import { TableGenericComponent } from '../../../../shared/components/table-generic/table-generic.component';
import { ButtonGenericComponent } from '../../../../shared/components/button-generic/button-generic.component';
import { DragDropAreaComponent } from '../../../../shared/components/drag-drop-area/drag-drop-area.component';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { FormField } from '../../../../shared/components/form-generic/interfaces/form-field';
import {
  ButtonGenericInterface,
  FormatOptions,
} from '../../../../shared/components/button-generic/interfaces/buttons';
import { ConfirmationService } from '../../../../shared/services/confirmation/confirmation.service';
import { HeaderTable } from '../../../../shared/components/table-generic/interfaces/header-table';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfMergeService } from '../../services/pdf-merge.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pdf-merge',
  standalone: true,
  imports: [
    MessagesComponent,
    TableGenericComponent,
    ButtonGenericComponent,
    DragDropAreaComponent,
    FormGenericComponent,
  ],
  templateUrl: './pdf-merge.component.html',
  styleUrl: './pdf-merge.component.scss',
})
export class PdfMergeComponent implements AfterViewInit {
  /** note drag and drop component */
  note = 'Arrastre y suelte archivos pdf aquí.';

  /** Initial number of items to display per page in the table */
  itemInitialPagination = 10;

  /** Flag to track if the table order has been modified */
  orderTable: boolean = false;

  /** Array to store the original files before any reordering */
  arrayFileWhitOutChange: File[] = [];

  /** Reference to the FormGenericComponent for file upload */
  @ViewChild(FormGenericComponent)
  formGenericComponent!: FormGenericComponent<{ file: File[] }>;

  /** Configuration for the file upload form field */
  formConfig: FormField<{ file: File[] }>[] = [
    {
      name: 'file',
      label: '',
      type: 'file',
      initialData: [],
      primeNgConfig: {
        fileOptions: {
          accept: ['pdf'], // Allowed file types
          uploadIcon: 'pi pi-arrow-down', // Icon for the upload button
          multiple: true, // Allow multiple file uploads
          chooseLabel: 'Seleccionar', // Label for the file selection button
          uploadLabel: 'Descargar Archivo', // Label for the upload button
          cancelLabel: 'Limpiar', // Label for the clear button
          noFooter: true, // Hide the footer in the file upload dialog
          uploadHandler: () => {
            this.onUpload(); // Handler for the upload action
          },
          onSelectHandler: (files: File[], fieldName: string) => {
            const currentFiles = this.getFormDataFile();

            // If no files are currently selected, validate and assign the new files
            if (currentFiles.length === 0) {
              this.validateAndAssignFiles(files, fieldName);
              return;
            }

            // Filter out duplicate files
            const newFiles = files.filter((file) => {
              return !currentFiles.some(
                (currentFile) =>
                  currentFile.name === file.name &&
                  currentFile.size === file.size &&
                  currentFile.lastModified === file.lastModified
              );
            });

            // If there are new files, validate and assign them
            if (newFiles.length > 0) {
              this.validateAndAssignFiles(newFiles, fieldName);
            }
          },
        },
      },
    },
  ];

  /** Configuration for buttons in the component */
  buttons: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-end gap-2',
    buttons: [
      {
        id: 1,
        icon: 'pi pi-check',
        label: 'Restablecer Orden Inicial Archivos',
        severity: 'primary',
        disabled: !this.getFormDataFile().length, // Disable the button if no files are selected
        action: () => this.restartTable(), // Action to reset the table to its initial state
      },
    ],
  };

  /** Array to store uploaded files */
  myfile: File[] = [];

  /** Reference to the image template for rendering images in the table */
  @ViewChild('imageTemplate') imageTemplate!: TemplateRef<any>;

  /** Reference to the TableGenericComponent for displaying files */
  @ViewChild(TableGenericComponent)
  tableGenericComponent!: TableGenericComponent<File>;

  /** Injected ConfirmationService for displaying confirmation dialogs */
  confirmationService: ConfirmationService = inject(ConfirmationService);

  /** Injected ToastrService for displaying message toast */
  private readonly toastr = inject(ToastrService);

  /** List of pagination options for the table */
  listPagination = [5, 10, 20, 50, 100];

  /** Allowed file types for upload */
  acceptedFiles: string[] = ['pdf'];

  /** Error message for invalid file types */
  messagesFiles: string = 'Solo se aceptan pdf.';

  /** Labels for file upload actions */
  chooseLabel = 'Seleccionar';
  uploadLabel = 'Descargar';
  cancelLabel = 'Limpiar';

  /** Header configuration for the table */
  headerData: HeaderTable<File>[] = [];

  /** Configuration for table operations (e.g., delete) */
  operation: ButtonGenericInterface = {
    buttons: [
      {
        id: 1,
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (row: File) => this.deleteItemRow(row), // Action to delete a row
      },
    ],
  };

  /** Format options for table columns */
  formatOptions: FormatOptions<File> = {
    size: {
      formatFunction: (v) => {
        if (v.size === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(v.size) / Math.log(k));
        return (
          parseFloat((v.size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
        );
      },
    },
    type: {
      formatFunction: (v) => {
        const [_, format] = v.type.split('/');
        return format?.toUpperCase() ?? '';
      },
    },
  };

  /** Enable drag-and-drop functionality for file upload */
  enableDragDrop = true;

  /** Error message to display for invalid files */
  errorMessage: string = '';

  /** Injected DomSanitizer for safely rendering HTML */
  sanitizer: DomSanitizer = inject(DomSanitizer);

  /** Injected DownloadImagePdfService for handling PDF generation */
  pdfMergeService: PdfMergeService = inject(PdfMergeService);

  /**
   * Handles file drop events.
   * @param event - The FileList containing the dropped files.
   */
  onDrop(event: FileList) {
    const files = Array.from(event);
    const fieldName = this.formConfig[0]?.name ?? 'file';
    this.validateAndAssignFiles(files, fieldName);
  }

  /**
   * Lifecycle hook that runs after the view is initialized.
   * Sets up the table headers and subscribes to form value changes.
   */
  ngAfterViewInit() {
    setTimeout(() => {
      // Configure the table headers
      this.headerData = [
        /*{
          field: 'text',
          header: 'Imagen',
          customContent: this.customContentTemplate1, // Custom template for rendering images
        },*/
        {
          field: 'name',
          header: 'Nombre',
        },
        {
          field: 'size',
          header: 'Tamaño',
        },
        {
          field: 'type',
          header: 'Tipo',
        },
      ];
    });

    // Subscribe to form value changes to update button states
    this.formGenericComponent.getForm.valueChanges.subscribe(() => {
      this.changeStateButton();
    });
  }

  /**
   * Validates and assigns files to the form.
   * @param files - The files to validate and assign.
   * @param fieldName - The name of the form field to assign the files to.
   */
  validateAndAssignFiles(files: FileList | File[] | null, fieldName: string) {
    if (!files) return;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    const filesArray = Array.isArray(files) ? files : Array.from(files);

    filesArray.forEach((file) => {
      if (
        file.type.includes('application/pdf')
        //&& this.hasAllowedExtension(file.type.split('/')[1], fieldName)
      ) {
        const isDuplicate = this.isFileDuplicate(file);
        if (!isDuplicate) {
          validFiles.push(file);
        }
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (validFiles.length > 0) {
      const currentFiles = this.getFormDataFile();
      const updatedFiles = [...currentFiles, ...validFiles];
      this.setFormDataFile(updatedFiles);
      this.arrayFileWhitOutChange = [
        ...this.arrayFileWhitOutChange,
        ...validFiles,
      ];
    }

    if (invalidFiles.length > 0) {
      this.showErrorMessages(invalidFiles);
    }
  }

  /**
   * Deletes a file from the table.
   * @param file - The file to delete.
   */
  deleteItemRow(file: File) {
    const updatedFiles = this.getFormDataFile().filter((f) => f !== file);
    this.setFormDataFile(updatedFiles);
    this.arrayFileWhitOutChange = this.arrayFileWhitOutChange.filter(
      (f) => f !== file
    );

    if (!updatedFiles.length) {
      this.arrayFileWhitOutChange = [];
    }
  }

  /**
   * Checks if a file is a duplicate.
   * @param fileRow - The file to check for duplicates.
   * @returns True if the file is a duplicate, otherwise false.
   */
  isFileDuplicate(fileRow: File): boolean {
    if (!this.getFormDataFile().length) return false;
    return this.getFormDataFile().some((currentFile) => {
      return (
        currentFile.name === fileRow.name &&
        currentFile.size === fileRow.size &&
        currentFile.lastModified === fileRow.lastModified
      );
    });
  }

  /**
   * Handles the file upload process.
   */
  onUpload() {
    if (this.tableGenericComponent?.dataTable.length === 1)
      this.toastr.warning(
        'Para combinar el PDF al menos deben existir dos archivos pdf',
        'Advertencia'
      );
    else {
      const { onClose } = this.confirmationService.openConfirmation();
      onClose((data: boolean | null | undefined) => {
        if (data) {
          this.merge(this.tableGenericComponent?.dataTable);
          this.setFormDataFile([]);
        }
      });
    }
  }

  merge(files: File[]) {
    this.pdfMergeService
      .mergeAndOpenPdfs(files)
      .catch((error) => {
        // Manejo de errores (aunque el servicio ya muestra toastr)
        // Lógica adicional de error si necesitas
        // Ejemplo: this.logErrorToService(error);
      })
      .finally(() => {
        // Siempre se ejecuta (éxito o error)
        //this.isLoading = false;
        // Opcional: Resetear selección si es necesario
        // this.selectedFiles = [];
      });
  }

  /**
   * Gets the current files from the form.
   * @returns An array of files.
   */
  getFormDataFile() {
    return (this.formGenericComponent?.getForm?.getRawValue()?.file ||
      []) as File[];
  }

  /**
   * Sets the files in the form.
   * @param file - The files to set.
   */
  setFormDataFile(file: File[]) {
    this.formGenericComponent?.getForm?.patchValue({ file });
  }

  /**
   * Displays error messages for invalid files.
   * @param invalidFiles - The list of invalid file names.
   */
  showErrorMessages(invalidFiles: string[]) {
    const bulletPoints = invalidFiles
      .map((file) => `<li>${file}</li>`)
      .join('');
    this.errorMessage = `
        Los siguientes archivos no son pdf permitidas:
        <ul>${bulletPoints}</ul>
      `;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  /**
   * Organizes the rows in the table.
   * @param event - The reordered files.
   */
  organizeRow(event: File[]) {
    if (!this.orderTable) this.arrayFileWhitOutChange = this.getFormDataFile();
    this.setFormDataFile(event);
    this.orderTable = true;
  }

  /**
   * Resets the table to its initial state.
   */
  restartTable() {
    if (this.orderTable) {
      this.setFormDataFile(this.arrayFileWhitOutChange);
    }
  }

  /**
   * Updates the state of the buttons based on the form data.
   */
  changeStateButton() {
    const firstButton = this.buttons?.buttons?.[0];
    if (firstButton) {
      firstButton.disabled = !this.getFormDataFile().length;
    }
    if (!this.getFormDataFile().length) {
      this.orderTable = false;
      this.arrayFileWhitOutChange = [];
    }
  }
}
