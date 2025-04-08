import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  CollectionReference,
  DocumentData,
  docData,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

/**
 * A fully type-safe generic Firestore CRUD service
 * @template T - The document type (must have optional 'id' property)
 */
@Injectable({
  providedIn: 'root',
})
export class GenericFirestoreService<T extends { id?: string }> {
  /** lib firebase comuninacate with con firestore(database) */
  firestore: Firestore = inject(Firestore);

  /**
   * Adds a new document to the specified Firestore collection as an Observable
   *
   * @template T - The generic type representing the document structure (must have optional 'id' property)
   *
   * @param {string} collectionName - The name of the Firestore collection where the document will be added
   * @param {Omit<T, 'id'>} item - The document data to add (excluding the 'id' property since it will be auto-generated)
   *
   * @returns {Observable<DocumentReference<T>>} An Observable that emits:
   *           - The Firestore DocumentReference of the newly created document when successful
   *           - An error if the operation fails
   *
   * @example
   * // Usage example:
   * this.genericFirestoreService.add('users', { name: 'John', age: 30 })
   *   .subscribe({
   *     next: docRef => console.log('Added with ID:', docRef.id),
   *     error: err => console.error('Error:', err)
   *   });
   */
  add(
    collectionName: string,
    item: Omit<T, 'id'>
  ): Observable<DocumentReference<T>> {
    const collectionRef = collection(
      this.firestore,
      collectionName
    ) as CollectionReference<T>;

    // Convert the Promise to an Observable
    return from(addDoc(collectionRef, item)) as unknown as Observable<
      DocumentReference<T>
    >;
  }

  /**
   * Gets all documents from the specified collection
   * @param collectionName - Name of the Firestore collection
   * @returns Observable of document array with populated IDs
   */
  getAll(collectionName: string): Observable<T[]> {
    const collectionRef = collection(
      this.firestore,
      collectionName
    ) as CollectionReference<T>;
    return collectionData(collectionRef, { idField: 'id' });
  }

  /**
   * Gets a single document by its ID
   * @param collectionName - Name of the Firestore collection
   * @param id - Document ID to retrieve
   * @returns Observable of the document with the ID populated
   */
  getById(collectionName: string, id: string): Observable<T> {
    const documentRef = doc(
      this.firestore,
      `${collectionName}/${id}`
    ) as DocumentReference<T>;
    return docData(documentRef, { idField: 'id' }) as Observable<T>;
  }

  /**
   * Updates an existing document
   * @param collectionName - Name of the Firestore collection
   * @param item - The complete item including ID
   * @returns Promise that resolves when update completes
   */
  update(collectionName: string, item: T): Observable<any> {
    const documentRef = doc(
      this.firestore,
      `${collectionName}/${item.id}`
    ) as DocumentReference<T>;
    const { id, ...data } = item;
    return from(updateDoc(documentRef, data as DocumentData));
  }

  /**
   * Deletes a document by ID
   * @param collectionName - Name of the Firestore collection
   * @param id - Document ID to delete
   * @returns Promise that resolves when deletion completes
   */
  delete(collectionName: string, id: string): Observable<any> {
    const documentRef = doc(
      this.firestore,
      `${collectionName}/${id}`
    ) as DocumentReference<T>;
    return from(deleteDoc(documentRef));
  }
}
