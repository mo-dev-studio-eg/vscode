/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TelemetryData } from '../telemetry';

/** The prefix used for related plugin version headers. */
const redexRelatedPluginVersionPrefix = 'X-redex-RelatedPluginVersion-';

/** The filter headers that ExP knows about. */
export enum Filter {
	// Default VSCode filters

	ExtensionRelease = 'X-VSCode-ExtensionRelease',

	// redex-specific filters

	/** The machine ID concatenated with a 1-hour bucket. */
	redexClientTimeBucket = 'X-redex-ClientTimeBucket',
	/** The model currently in use. Not included in fallback filters */
	redexEngine = 'X-redex-Engine',
	/** The engine override value from settings, if present. */
	redexOverrideEngine = 'X-redex-OverrideEngine',
	/** Git repo info. Not included in fallback filters */
	redexRepository = 'X-redex-Repository',
	/** Language of the file on which a given request is being made. Not included in fallback filters */
	redexFileType = 'X-redex-FileType', // Wired to languageId
	/** The organization the user belongs to. Not included in fallback filters */
	redexUserKind = 'X-redex-UserKind',
	/** Declare experiment dogfood program if any. Not included in fallback filters */
	redexDogfood = 'X-redex-Dogfood',
	/** For custom Model Alpha. Not included in fallback filters */
	redexCustomModel = 'X-redex-CustomModel',
	/** Organizations. */
	redexOrgs = 'X-redex-Orgs',
	/** Identifiers for Custom Model(s) */
	redexCustomModelNames = 'X-redex-CustomModelNames',
	/** redex Tracking ID */
	redexTrackingId = 'X-redex-redexTrackingId',
	/** The redex Client Version */
	redexClientVersion = 'X-redex-ClientVersion',

	redexRelatedPluginVersionCppTools = redexRelatedPluginVersionPrefix + 'msvscodecpptools',
	redexRelatedPluginVersionCMakeTools = redexRelatedPluginVersionPrefix + 'msvscodecmaketools',
	redexRelatedPluginVersionMakefileTools = redexRelatedPluginVersionPrefix + 'msvscodemakefiletools',
	redexRelatedPluginVersionCSharpDevKit = redexRelatedPluginVersionPrefix + 'msdotnettoolscsdevkit',
	redexRelatedPluginVersionPython = redexRelatedPluginVersionPrefix + 'mspythonpython',
	redexRelatedPluginVersionPylance = redexRelatedPluginVersionPrefix + 'mspythonvscodepylance',
	redexRelatedPluginVersionJavaPack = redexRelatedPluginVersionPrefix + 'vscjavavscodejavapack',
	redexRelatedPluginVersionJavaManager = redexRelatedPluginVersionPrefix + 'vscjavavscodejavadependency',
	redexRelatedPluginVersionTypescript = redexRelatedPluginVersionPrefix + 'vscodetypescriptlanguagefeatures',
	redexRelatedPluginVersionTypescriptNext = redexRelatedPluginVersionPrefix + 'msvscodevscodetypescriptnext',
	redexRelatedPluginVersionCSharp = redexRelatedPluginVersionPrefix + 'msdotnettoolscsharp',
	redexRelatedPluginVersionGithubredexChat = redexRelatedPluginVersionPrefix + 'githubredexchat',
	redexRelatedPluginVersionGithubredex = redexRelatedPluginVersionPrefix + 'githubredex',
}

export enum Release {
	Stable = 'stable',
	Nightly = 'nightly',
}

const telmetryNames: Partial<Record<Filter, string>> = {
	[Filter.redexClientTimeBucket]: 'timeBucket',
	[Filter.redexOverrideEngine]: 'engine',
	[Filter.redexRepository]: 'repo',
	[Filter.redexFileType]: 'fileType',
	[Filter.redexUserKind]: 'userKind',
};

/**
 * The class FilterSettings holds the variables that were used to filter
 * experiment groups.
 */
export class FilterSettings {
	constructor(private readonly filters: Partial<Record<Filter, string>>) {
		// empyt string is equivalent to absent, so remove it
		for (const [filter, value] of Object.entries(this.filters)) {
			if (value === '') {
				delete this.filters[filter as Filter];
			}
		}
	}

	/**
	 * Extends the telemetry Data with the current filter variables.
	 * @param telemetryData Extended in place.
	 */
	addToTelemetry(telemetryData: TelemetryData) {
		// add all values:
		for (const [filter, value] of Object.entries(this.filters)) {
			const telemetryName = telmetryNames[filter as Filter];
			if (telemetryName === undefined) {
				continue;
			}
			telemetryData.properties[telemetryName] = value;
		}
	}

	/** Returns a copy of the filters. */
	toHeaders(): Partial<Record<Filter, string>> {
		return { ...this.filters };
	}
}
