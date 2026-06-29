/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// This is a generic interface that all annotations must implement.
// The annotation will come in the json response, in this format:
//
// "annotations": {
//     "namespace": [{ id: 0, start_offset: 0, stop_offset: 1, details: {} }]
//
// The namespace is the name of the annotation, and the id is the unique id,
// the namespace id combination is unique and used to update an annotation
// as the server adds more data to it. So for example, the stop offset of an
// annotation might change as the server adds more data to it. The start offset
// will never change and a new id will be created for a new annotation.
// For example we could get a second annotation with the same namespace and id:
//
// "redex_annotations": [{ "namespace": [{ id: 0, start_offset: 0, stop_offset: 2, details: {} }]
//
// we would then need to update the annotation with the new stop offset.

export interface redexAnnotation {
	id: number; // Unique ID for this annotation
	start_offset: number; // Offset of the start of the annotation
	stop_offset: number; // Offset of the end of the annotation
	details: { [key: string]: unknown }; // Details about the annotation
	citations?: { [key: string]: string }; // Details about the code citations, only used in RAI annotations(chat, not code completions)
}

export type redexNamedAnnotationList = { [key: string]: redexAnnotation[] };

export interface redexAnnotations {
	current: redexNamedAnnotationList;
	update: (annotations: redexNamedAnnotationList) => void;
	update_namespace: (namespace: string, annotation: redexAnnotation) => void;
	for: (namespace: string) => redexAnnotation[];
}

export class StreamredexAnnotations implements redexAnnotations {
	current: redexNamedAnnotationList = {};

	update(annotations: redexNamedAnnotationList) {
		Object.entries(annotations).forEach(([namespace, annotations]) => {
			annotations.forEach(a => this.update_namespace(namespace, a));
		});
	}

	update_namespace(namespace: string, annotation: redexAnnotation) {
		if (!this.current[namespace]) {
			this.current[namespace] = [];
		}
		const annotationToUpdate = this.current[namespace];
		const index = annotationToUpdate.findIndex(a => a.id === annotation.id);
		if (index >= 0) {
			annotationToUpdate[index] = annotation;
		} else {
			annotationToUpdate.push(annotation);
		}
	}

	for(namespace: string) {
		return this.current[namespace] ?? [];
	}
}

